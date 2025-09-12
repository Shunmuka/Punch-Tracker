"""
Notification service for email and webhook alerts
"""
import os
import requests
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models import User, Session, Punch, NotificationPrefs
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class NotificationService:
    def __init__(self):
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@punchtracker.com")
        self.from_name = os.getenv("FROM_NAME", "PunchTracker")
        
        # SMTP fallback
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")

    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email using SendGrid or SMTP fallback"""
        try:
            if self.sendgrid_api_key:
                return self._send_via_sendgrid(to_email, subject, html_content)
            elif self.smtp_host:
                return self._send_via_smtp(to_email, subject, html_content)
            else:
                print(f"Email service not configured. Would send to {to_email}: {subject}")
                return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SendGrid"""
        message = Mail(
            from_email=(self.from_email, self.from_name),
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
        response = sg.send(message)
        return response.status_code == 202

    def _send_via_smtp(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SMTP"""
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{self.from_name} <{self.from_email}>"
        msg['To'] = to_email
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
        
        return True

    def send_webhook(self, webhook_url: str, data: dict) -> bool:
        """Send data to webhook URL (Slack/Discord)"""
        try:
            response = requests.post(webhook_url, json=data, timeout=10)
            return response.status_code in [200, 201, 204]
        except Exception as e:
            print(f"Failed to send webhook: {e}")
            return False

    def generate_weekly_report(self, user: User, db: Session) -> dict:
        """Generate weekly progress report data"""
        now = datetime.utcnow()
        week_start = now - timedelta(days=7)
        two_weeks_ago = now - timedelta(days=14)
        
        # This week's data
        this_week_sessions = db.query(Session).filter(
            and_(
                Session.user_id == user.id,
                Session.started_at >= week_start
            )
        ).all()
        
        this_week_punches = db.query(Punch).join(Session).filter(
            and_(
                Session.user_id == user.id,
                Punch.timestamp >= week_start
            )
        ).all()
        
        # Last week's data
        last_week_sessions = db.query(Session).filter(
            and_(
                Session.user_id == user.id,
                Session.started_at >= two_weeks_ago,
                Session.started_at < week_start
            )
        ).all()
        
        last_week_punches = db.query(Punch).join(Session).filter(
            and_(
                Session.user_id == user.id,
                Punch.timestamp >= two_weeks_ago,
                Punch.timestamp < week_start
            )
        ).all()
        
        # Calculate metrics
        this_week_total = sum(p.count for p in this_week_punches)
        this_week_avg_speed = sum(p.speed * p.count for p in this_week_punches) / max(len(this_week_punches), 1)
        
        last_week_total = sum(p.count for p in last_week_punches)
        last_week_avg_speed = sum(p.speed * p.count for p in last_week_punches) / max(len(last_week_punches), 1)
        
        # Calculate percentage change
        if last_week_total > 0:
            delta_percent = ((this_week_total - last_week_total) / last_week_total) * 100
        else:
            delta_percent = 100 if this_week_total > 0 else 0
        
        # Find best session
        best_session = None
        if this_week_sessions:
            best_session = max(this_week_sessions, key=lambda s: len(s.punches))
        
        return {
            "user": user,
            "this_week": {
                "total_punches": this_week_total,
                "avg_speed": round(this_week_avg_speed, 2),
                "sessions_count": len(this_week_sessions)
            },
            "last_week": {
                "total_punches": last_week_total,
                "avg_speed": round(last_week_avg_speed, 2),
                "sessions_count": len(last_week_sessions)
            },
            "delta_percent": round(delta_percent, 1),
            "best_session": best_session
        }

    def send_weekly_report(self, user: User, db: Session) -> bool:
        """Send weekly progress report to user"""
        prefs = db.query(NotificationPrefs).filter(NotificationPrefs.user_id == user.id).first()
        if not prefs:
            return False
        
        report_data = self.generate_weekly_report(user, db)
        
        # Generate email content
        subject = f"Weekly Progress Report - {user.username}"
        html_content = self._generate_email_html(report_data)
        
        success = True
        
        # Send email if enabled
        if prefs.email_enabled:
            success &= self.send_email(user.email, subject, html_content)
        
        # Send webhook if enabled
        if prefs.webhook_enabled and prefs.webhook_url:
            webhook_data = self._generate_webhook_data(report_data)
            success &= self.send_webhook(prefs.webhook_url, webhook_data)
        
        return success

    def _generate_email_html(self, report_data: dict) -> str:
        """Generate HTML email content"""
        user = report_data["user"]
        this_week = report_data["this_week"]
        last_week = report_data["last_week"]
        delta_percent = report_data["delta_percent"]
        best_session = report_data["best_session"]
        
        delta_color = "green" if delta_percent >= 0 else "red"
        delta_symbol = "+" if delta_percent >= 0 else ""
        
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #E53935;">🥊 Weekly Progress Report</h2>
            <p>Hello {user.username}!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>This Week's Performance</h3>
                <ul>
                    <li><strong>Total Punches:</strong> {this_week['total_punches']}</li>
                    <li><strong>Average Speed:</strong> {this_week['avg_speed']} mph</li>
                    <li><strong>Sessions:</strong> {this_week['sessions_count']}</li>
                </ul>
            </div>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>vs Last Week</h3>
                <p style="color: {delta_color}; font-size: 18px;">
                    <strong>{delta_symbol}{delta_percent}%</strong> change in total punches
                </p>
            </div>
            
            {f'<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;"><h3>🏆 Best Session</h3><p><strong>{best_session.name}</strong> with {len(best_session.punches)} punches</p></div>' if best_session else ''}
            
            <p>Keep up the great work! 💪</p>
            <p style="color: #666; font-size: 12px;">- The PunchTracker Team</p>
        </body>
        </html>
        """

    def _generate_webhook_data(self, report_data: dict) -> dict:
        """Generate webhook payload for Slack/Discord"""
        user = report_data["user"]
        this_week = report_data["this_week"]
        delta_percent = report_data["delta_percent"]
        
        delta_symbol = "+" if delta_percent >= 0 else ""
        
        return {
            "text": f"🥊 Weekly Progress Report for {user.username}",
            "attachments": [
                {
                    "color": "good" if delta_percent >= 0 else "danger",
                    "fields": [
                        {
                            "title": "This Week",
                            "value": f"Punches: {this_week['total_punches']}\nSpeed: {this_week['avg_speed']} mph\nSessions: {this_week['sessions_count']}",
                            "short": True
                        },
                        {
                            "title": "Change vs Last Week",
                            "value": f"{delta_symbol}{delta_percent}%",
                            "short": True
                        }
                    ]
                }
            ]
        }

# Global notification service instance
notification_service = NotificationService()
