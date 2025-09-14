import os
import smtplib
import requests
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from models import User, NotificationPrefs, Punch, Workout
from schemas import WeeklyReportData


class NotificationService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        self.webhook_drift_sec = int(os.getenv("WEBHOOK_DRIFT_SEC", "120"))

    def get_user_prefs(self, db: Session, user_id: int) -> Optional[NotificationPrefs]:
        """Get user notification preferences"""
        return db.query(NotificationPrefs).filter(NotificationPrefs.user_id == user_id).first()

    def upsert_prefs(self, db: Session, user_id: int, prefs_data: Dict[str, Any]) -> NotificationPrefs:
        """Create or update user notification preferences"""
        prefs = self.get_user_prefs(db, user_id)
        
        if not prefs:
            prefs = NotificationPrefs(user_id=user_id)
            db.add(prefs)
        
        if prefs_data.get("email_enabled") is not None:
            prefs.email_enabled = prefs_data["email_enabled"]
        if prefs_data.get("webhook_enabled") is not None:
            prefs.webhook_enabled = prefs_data["webhook_enabled"]
        if prefs_data.get("webhook_url") is not None:
            prefs.webhook_url = prefs_data["webhook_url"]
        
        prefs.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(prefs)
        return prefs

    def generate_weekly_report(self, db: Session, user_id: int) -> WeeklyReportData:
        """Generate weekly progress report data for a user"""
        now = datetime.utcnow()
        week_start = now - timedelta(days=7)
        prior_week_start = week_start - timedelta(days=7)
        
        # Current week data
        current_punches = db.query(Punch).join(Workout).filter(
            Workout.user_id == user_id,
            Punch.timestamp >= week_start
        ).all()
        
        current_workouts = db.query(Workout).filter(
            Workout.user_id == user_id,
            Workout.started_at >= week_start
        ).all()
        
        # Prior week data
        prior_punches = db.query(Punch).join(Workout).filter(
            Workout.user_id == user_id,
            Punch.timestamp >= prior_week_start,
            Punch.timestamp < week_start
        ).all()
        
        # Calculate metrics
        total_punches = sum(p.count for p in current_punches)
        avg_speed = sum(p.speed * p.count for p in current_punches) / total_punches if total_punches > 0 else 0
        workouts_count = len(current_workouts)
        
        # Best session (workout with most punches)
        best_session_punches = 0
        for workout in current_workouts:
            workout_punches = sum(p.count for p in current_punches if p.workout_id == workout.id)
            best_session_punches = max(best_session_punches, workout_punches)
        
        # Calculate change percentage
        prior_total = sum(p.count for p in prior_punches)
        change_percent = 0
        if prior_total > 0:
            change_percent = ((total_punches - prior_total) / prior_total) * 100
        
        return WeeklyReportData(
            total_punches=total_punches,
            avg_speed=round(avg_speed, 2),
            workouts_count=workouts_count,
            best_session_punches=best_session_punches,
            change_percent=round(change_percent, 1),
            week_start=week_start,
            week_end=now
        )

    def send_email_report(self, user: User, report_data: WeeklyReportData) -> bool:
        """Send weekly report via email"""
        if not self.smtp_host or not self.smtp_user:
            return False
        
        try:
            # Create email content
            subject = f"Weekly Punch Report - {user.username}"
            
            html_content = f"""
            <html>
            <body>
                <h2>Weekly Punch Report</h2>
                <p>Hello {user.username},</p>
                
                <h3>This Week's Stats</h3>
                <ul>
                    <li><strong>Total Punches:</strong> {report_data.total_punches}</li>
                    <li><strong>Average Speed:</strong> {report_data.avg_speed} mph</li>
                    <li><strong>Workouts:</strong> {report_data.workouts_count}</li>
                    <li><strong>Best Session:</strong> {report_data.best_session_punches} punches</li>
                    <li><strong>Change from Last Week:</strong> {report_data.change_percent:+.1f}%</li>
                </ul>
                
                <p>Keep up the great work!</p>
                <p>- PunchTracker Team</p>
            </body>
            </html>
            """
            
            # Send via SendGrid if available
            if self.sendgrid_api_key:
                return self._send_via_sendgrid(user.email, subject, html_content)
            else:
                return self._send_via_smtp(user.email, subject, html_content)
                
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SendGrid API"""
        try:
            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": self.smtp_user, "name": "PunchTracker"},
                "subject": subject,
                "content": [{"type": "text/html", "value": html_content}]
            }
            
            response = requests.post(url, headers=headers, json=data)
            return response.status_code == 202
        except Exception as e:
            print(f"SendGrid error: {e}")
            return False

    def _send_via_smtp(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SMTP"""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.smtp_user
            msg["To"] = to_email
            
            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"SMTP error: {e}")
            return False

    def send_webhook_report(self, webhook_url: str, user: User, report_data: WeeklyReportData) -> bool:
        """Send weekly report via webhook"""
        try:
            payload = {
                "user": {
                    "username": user.username,
                    "email": user.email
                },
                "report": {
                    "total_punches": report_data.total_punches,
                    "avg_speed": report_data.avg_speed,
                    "workouts_count": report_data.workouts_count,
                    "best_session_punches": report_data.best_session_punches,
                    "change_percent": report_data.change_percent,
                    "week_start": report_data.week_start.isoformat(),
                    "week_end": report_data.week_end.isoformat()
                }
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            return response.status_code in [200, 201, 202]
        except Exception as e:
            print(f"Webhook error: {e}")
            return False

    def send_weekly_reports(self, db: Session) -> Dict[str, int]:
        """Send weekly reports to all users with enabled notifications"""
        results = {"emails_sent": 0, "webhooks_sent": 0, "errors": 0}
        
        users_with_prefs = db.query(User).join(NotificationPrefs).filter(
            NotificationPrefs.email_enabled == True
        ).all()
        
        for user in users_with_prefs:
            try:
                # Skip if email not verified
                if not user.email_verified:
                    continue
                
                prefs = self.get_user_prefs(db, user.id)
                if not prefs:
                    continue
                
                # Generate report
                report_data = self.generate_weekly_report(db, user.id)
                
                # Send email
                if prefs.email_enabled:
                    if self.send_email_report(user, report_data):
                        results["emails_sent"] += 1
                    else:
                        results["errors"] += 1
                
                # Send webhook
                if prefs.webhook_enabled and prefs.webhook_url:
                    if self.send_webhook_report(prefs.webhook_url, user, report_data):
                        results["webhooks_sent"] += 1
                    else:
                        results["errors"] += 1
                        
            except Exception as e:
                print(f"Error sending report to user {user.id}: {e}")
                results["errors"] += 1
        
        return results
