import smtplib
import random
from email.mime.text import MIMEText

# Function to generate a random 6-digit OTP
def generate_otp():
    return random.randint(100000, 999999)

# Function to send an OTP email
def send_otp_email(recipient_email, otp):
    sender_email = "your-email@example.com"  # Replace with your email
    sender_password = "your-email-password"  # Replace with your password

    subject = "Your OTP for Password Reset"
    body = f"Your OTP for password reset is: {otp}. Please do not share it with anyone."

    # Construct the email
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient_email

    try:
        # Use an SMTP server to send the email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print("OTP email sent successfully.")
    except Exception as e:
        print("Error sending email:", e)

# Example: Call this when handling forgot password
if __name__ == "__main__":
    otp = generate_otp()
    send_otp_email("recipient@example.com", otp)
