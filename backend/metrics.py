from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
import time

# Request metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

# Database metrics
DB_QUERY_DURATION = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['operation']
)

# Business metrics
PUNCHES_LOGGED = Counter(
    'punches_logged_total',
    'Total punches logged',
    ['punch_type']
)

WORKOUTS_STARTED = Counter(
    'workouts_started_total',
    'Total workouts started',
    ['template']
)

NOTIFICATIONS_SENT = Counter(
    'notifications_sent_total',
    'Total notifications sent',
    ['type', 'status']
)

# System metrics
ACTIVE_WORKOUTS = Gauge(
    'active_workouts',
    'Number of currently active workouts'
)

def record_request_metrics(request: Request, response: Response, duration: float):
    """Record request metrics"""
    method = request.method
    endpoint = request.url.path
    status_code = response.status_code
    
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)

def record_db_operation(operation: str, duration: float):
    """Record database operation metrics"""
    DB_QUERY_DURATION.labels(operation=operation).observe(duration)

def record_punch_logged(punch_type: str):
    """Record punch logged metric"""
    PUNCHES_LOGGED.labels(punch_type=punch_type).inc()

def record_workout_started(template: str):
    """Record workout started metric"""
    WORKOUTS_STARTED.labels(template=template).inc()

def record_notification_sent(notification_type: str, status: str):
    """Record notification sent metric"""
    NOTIFICATIONS_SENT.labels(type=notification_type, status=status).inc()

def update_active_workouts(count: int):
    """Update active workouts gauge"""
    ACTIVE_WORKOUTS.set(count)

def get_metrics():
    """Get Prometheus metrics"""
    return generate_latest()

def get_metrics_content_type():
    """Get Prometheus metrics content type"""
    return CONTENT_TYPE_LATEST
