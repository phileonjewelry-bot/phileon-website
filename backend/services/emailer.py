import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ALERT_TO = os.getenv("ALERT_EMAIL_TO", "phileon.jewelry@gmail.com")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")  # your sending inbox
SMTP_PASS = os.getenv("SMTP_PASS")  # app password (Gmail App Password recommended)
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "no-reply@getyourphileon.com")

def send_email(subject: str, text: str):
    if not SMTP_USER or not SMTP_PASS:
        # Fail silently in dev if creds not set
        print("[EMAIL] Missing SMTP_USER/SMTP_PASS. Skipping email:", subject)
        return

    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM
    msg["To"] = ALERT_TO
    msg["Subject"] = subject
    msg.attach(MIMEText(text, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM, [ALERT_TO], msg.as_string())