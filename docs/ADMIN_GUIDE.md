# TrailRoom Admin Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Admin Access](#admin-access)
3. [Dashboard Overview](#dashboard-overview)
4. [User Management](#user-management)
5. [Credit & Payment Management](#credit--payment-management)
6. [Try-On Job Monitoring](#try-on-job-monitoring)
7. [System Analytics](#system-analytics)
8. [Security & Abuse Detection](#security--abuse-detection)
9. [Audit Logs](#audit-logs)
10. [Best Practices](#best-practices)

---

## Introduction

The TrailRoom Admin Panel provides comprehensive tools for managing users, monitoring system health, overseeing payments, and maintaining platform security. This guide is for administrators with elevated access privileges.

### Admin Roles

TrailRoom has three admin role levels:

| Role | Permissions | Use Case |
|------|-------------|----------|
| **super_admin** | Full system access | CTO, Technical Lead |
| **support_admin** | User management, credits, support | Customer Support Team |
| **finance_admin** | Payments, billing, invoices | Finance Team |

---

## Admin Access

### Logging In

1. Navigate to the admin portal: `https://admin.trailroom.com`
2. Login with your admin credentials
3. You'll be directed to the admin dashboard

### First-Time Setup

When you first access the admin panel:

1. Change your default password
2. Enable two-factor authentication (if available)
3. Review audit log to confirm no unauthorized access
4. Familiarize yourself with the dashboard layout

---

## Dashboard Overview

### Main Dashboard

The admin dashboard provides a real-time overview:

#### Key Metrics Cards

1. **Total Users**
   - Free users count
   - Paid users count
   - Growth rate

2. **Revenue Metrics**
   - Today's revenue
   - This month's revenue
   - Revenue growth percentage

3. **API Usage**
   - Total API calls today
   - Active API keys
   - Average response time

4. **System Health**
   - Active try-on jobs
   - Queue length
   - Error rate

#### Charts & Graphs

- **User Growth**: Line chart showing user registration over time
- **Revenue Trend**: Bar chart showing daily/weekly/monthly revenue
- **Try-On Stats**: Pie chart of successful vs failed generations
- **Popular Modes**: Distribution of top-only vs full-outfit usage

---

## User Management

### Viewing Users

#### User List

Navigate to **Users** to see all registered users:

**Columns**:
- User ID
- Email
- Role
- Credit Balance
- Registration Date
- Last Active
- Status (Active/Suspended)

**Actions**:
- Search by email or user ID
- Filter by role, status, or registration date
- Sort by any column
- Bulk actions

#### User Search

Use the search bar to find specific users:
```
Search by:
- Email address
- User ID
- Partial email match
```

### User Details

Click on any user to view detailed information:

#### Profile Tab

- Full user details
- Account creation date
- Authentication method (Email/Google)
- Last login time
- Current credit balance
- Total credits purchased
- Total credits used

#### Activity Tab

- Recent try-on generations
- API calls made
- Login history
- IP addresses used

#### Transactions Tab

- All credit transactions
- Purchase history
- Refunds received
- Admin adjustments

#### API Keys Tab

- Active API keys
- Key usage statistics
- Last used timestamps

### Admin Actions on Users

#### Add/Deduct Credits

**Use Case**: Compensation, promotional credits, or corrections

1. Open user detail page
2. Click **Manage Credits**
3. Enter amount:
   - Positive number to add credits
   - Negative number to deduct credits
4. Add description (required): Reason for adjustment
5. Click **Confirm**

**Example**:
```
Amount: 100
Description: "Promotional credit for beta testing"
```

Credits are immediately reflected in user's account with a transaction record.

#### Change User Role

**Use Case**: Promote to admin or modify permissions

1. Open user detail page
2. Click **Change Role**
3. Select new role:
   - user
   - support_admin
   - finance_admin
   - super_admin
4. Confirm action

**Warning**: Be cautious with super_admin role - it has full system access.

#### Suspend User

**Use Case**: Abuse, policy violation, fraud

1. Open user detail page
2. Click **Suspend Account**
3. Select reason:
   - Policy violation
   - Payment fraud
   - Abuse detection
   - Other (specify)
4. Add notes for audit trail
5. Confirm suspension

**Effect**:
- User cannot login
- API keys are disabled
- Existing sessions terminated
- Jobs in queue are cancelled
- Credits remain but cannot be used

#### Reactivate User

1. Open suspended user's detail page
2. Click **Reactivate Account**
3. Add notes explaining reactivation
4. Confirm

User can login immediately and resume normal usage.

#### Reset Password

**Use Case**: User forgot password, security concern

1. Open user detail page
2. Click **Reset Password**
3. New temporary password is generated
4. Send to user via email or securely share

**Note**: User must change password on next login.

---

## Credit & Payment Management

### Credit Overview

Navigate to **Credits** to see system-wide credit statistics:

- Total credits in circulation
- Credits purchased today/week/month
- Credits consumed today/week/month
- Average credits per user

### Credit Transactions

View all credit movements across the platform:

**Filters**:
- Transaction type (purchase, usage, refund, admin_adjustment)
- Date range
- User ID
- Amount range

**Export**: Download transaction report as CSV

### Manual Credit Adjustments

For bulk operations or special cases:

1. Navigate to **Credits** > **Bulk Adjustment**
2. Upload CSV with format:
   ```csv
   user_email,credits,description
   user1@example.com,50,"Compensation for downtime"
   user2@example.com,-10,"Correction for duplicate charge"
   ```
3. Review preview
4. Execute bulk adjustment

All adjustments are logged in audit trail.

### Payment Management

Navigate to **Payments** to oversee all transactions:

#### Payment Dashboard

- Total payments received
- Pending payments
- Failed payments
- Refunded payments

#### Payment Details

Click on any payment to view:
- Razorpay order ID and payment ID
- User details
- Amount and credits
- Discount applied
- Payment status
- Timestamp
- Payment method

### Refund Processing

**Use Case**: User complaint, failed delivery, technical issue

1. Find payment in **Payments** list
2. Click **Issue Refund**
3. Select refund type:
   - **Full Refund**: Return full amount + deduct all credits
   - **Partial Refund**: Specify amount and credits to deduct
4. Add reason (required)
5. Confirm refund

**Process**:
1. Credits are deducted from user account
2. Refund is initiated via Razorpay
3. User receives refund in 5-7 business days
4. Invoice is updated
5. Transaction is logged

### Payment Disputes

For disputed transactions:

1. Navigate to **Payments** > **Disputes**
2. Review dispute details
3. Check transaction history
4. Contact user if needed
5. Take action:
   - **Accept Dispute**: Issue refund
   - **Reject Dispute**: Provide evidence
   - **Escalate**: Forward to Razorpay support

---

## Try-On Job Monitoring

### Job Monitor Dashboard

Navigate to **Jobs** for real-time monitoring:

#### Real-Time Stats

- Jobs in queue
- Jobs processing
- Jobs completed (today)
- Jobs failed (today)
- Average processing time
- Success rate

#### Live Job Feed

See jobs as they're created and processed:

- Job ID
- User email
- Mode (top/full)
- Status
- Queue position
- Created time
- Processing time

### Job Details

Click any job to view:

- **Inputs**: Person image and clothing images (thumbnails)
- **Output**: Result image (if completed)
- **Metadata**:
  - User who created it
  - Credits charged
  - Mode used
  - Timestamps (created, started, completed)
  - Error message (if failed)
  - AI model used
  - Processing time

### Admin Actions on Jobs

#### Retry Failed Job

**Use Case**: Temporary AI service issue, want to give user another chance

1. Open failed job details
2. Click **Retry Job**
3. Confirm action

**Process**:
- Job is re-queued
- No additional credits charged
- New job ID generated but linked to original
- User notified if successful

#### Force Cancel Job

**Use Case**: Stuck job, inappropriate content detected

1. Open job details
2. Click **Force Cancel**
3. Select reason:
   - Technical issue
   - Inappropriate content
   - User request
   - Other
4. Choose whether to refund credits
5. Confirm

#### Refund Credits for Job

**Use Case**: Quality issue, user complaint

1. Open job details
2. Click **Refund Credits**
3. Credits immediately added back to user
4. Transaction logged

#### Flag as Inappropriate

**Use Case**: Policy violation, inappropriate images

1. Open job details
2. Click **Flag Job**
3. Select reason:
   - Nudity/explicit content
   - Violence
   - Hate speech/symbols
   - Copyright violation
   - Other
4. Add notes
5. Confirm

**Effect**:
- Job marked for review
- Images blurred in user's history
- User may receive warning
- Repeated violations → account suspension

### Job Analytics

View trends and patterns:

- Peak usage times
- Mode popularity (top vs full)
- Average success rate
- Common failure reasons
- Processing time trends

---

## System Analytics

### Usage Analytics

Navigate to **Analytics** for comprehensive insights:

#### Overview Dashboard

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- API calls per day
- Credits consumed per day
- Revenue per day

#### User Analytics

- New user registrations (daily/weekly/monthly)
- User retention rate
- Churn rate
- User lifetime value
- Geographic distribution

#### Revenue Analytics

- Revenue trends
- Average transaction value
- Popular credit packages
- Discount usage
- Payment method breakdown

#### API Analytics

- Most-used endpoints
- API response times
- Error rates by endpoint
- API key usage distribution
- Rate limit hits

### Exporting Reports

Generate custom reports:

1. Navigate to **Analytics** > **Reports**
2. Select report type:
   - User Activity Report
   - Revenue Report
   - API Usage Report
   - Job Statistics Report
3. Choose date range
4. Select format (CSV, PDF, Excel)
5. Click **Generate**
6. Download when ready

---

## Security & Abuse Detection

### Abuse Detection System

Navigate to **Security** to monitor suspicious activity:

#### Automatic Detection

The system automatically flags:

- **Excessive Usage**: More than 100 generations per hour
- **API Scraping**: Pattern detection for automated scraping
- **Failed Payments**: Multiple failed payment attempts
- **Multiple Accounts**: Same payment method across accounts
- **Unusual Activity**: Login from multiple locations

#### Manual Review Queue

Review flagged accounts:

1. Navigate to **Security** > **Flagged Accounts**
2. Review each case:
   - View user activity
   - Check transaction history
   - Review job history
   - Check for patterns
3. Take action:
   - Clear flag (false positive)
   - Issue warning
   - Suspend account
   - Ban account

### IP Blocking

Block malicious IPs:

1. Navigate to **Security** > **IP Management**
2. Add IP to blocklist:
   - Single IP: `192.168.1.100`
   - IP range: `192.168.1.0/24`
3. Add reason
4. Set duration (temporary or permanent)

### Rate Limiting

Manage rate limits:

1. Navigate to **Security** > **Rate Limits**
2. View current limits by user tier
3. Adjust if needed:
   - Requests per minute
   - Requests per hour
   - Burst allowance

### Security Alerts

Configure alerts for:

- Multiple failed login attempts
- Large credit purchases
- Unusual activity patterns
- System errors
- High API usage

---

## Audit Logs

### Viewing Audit Logs

Navigate to **Audit Logs** to see all admin actions:

#### Log Entries

Each log entry contains:
- Timestamp
- Admin user who performed action
- Action type
- Target (user, payment, job, etc.)
- Before/after values
- IP address
- Success/failure status

#### Searching Logs

Filter logs by:
- Date range
- Admin user
- Action type
- Target user
- Status

#### Export Logs

Download audit logs for compliance:

1. Select date range
2. Choose format (CSV, JSON)
3. Download

**Retention**: Logs are kept for 1 year

### Common Audit Actions

- User credit adjustments
- Role changes
- Account suspensions
- Payment refunds
- Job cancellations
- System configuration changes

---

## Best Practices

### User Management

1. **Always Add Notes**: When taking actions on user accounts, always add clear notes for audit trail
2. **Verify Before Suspending**: Double-check evidence before suspending accounts
3. **Communicate**: Inform users of actions taken (unless security concern)
4. **Regular Reviews**: Periodically review flagged accounts
5. **Document Decisions**: Keep record of decisions for policy violations

### Credit Management

1. **Be Generous with Refunds**: For genuine issues, refund credits promptly
2. **Log All Adjustments**: Always provide clear description for manual adjustments
3. **Monitor for Abuse**: Watch for patterns of refund requests
4. **Promotional Credits**: Use bulk adjustment for campaigns
5. **Regular Audits**: Reconcile credit transactions monthly

### Payment Management

1. **Quick Refunds**: Process legitimate refund requests within 24 hours
2. **Investigate Disputes**: Thoroughly review before denying disputes
3. **Payment Verification**: For high-value transactions, verify with user
4. **Fraud Prevention**: Watch for patterns of failed payments
5. **Documentation**: Keep notes on all payment issues

### Job Monitoring

1. **Investigate Failures**: Look into unusual failure patterns
2. **Quality Control**: Randomly review successful generations
3. **Performance Tracking**: Monitor processing times for degradation
4. **Retry Judiciously**: Only retry failed jobs with clear technical issues
5. **Content Moderation**: Regularly review flagged content

### Security

1. **Regular Reviews**: Check security dashboard daily
2. **Quick Response**: Act on security alerts within 1 hour
3. **Pattern Recognition**: Look for abuse patterns
4. **Balance**: Be firm on policy but fair to users
5. **Stay Updated**: Keep informed of new security threats

### Audit & Compliance

1. **Review Logs**: Regularly review audit logs for anomalies
2. **Export Regularly**: Back up audit logs monthly
3. **Access Control**: Only grant admin access when necessary
4. **Password Security**: Use strong passwords and 2FA
5. **Documentation**: Maintain clear procedures for common actions

---

## Common Admin Tasks

### Handling User Complaints

**Scenario**: User complains about poor generation quality

**Steps**:
1. Open user's account
2. Find the specific job in history
3. Review input images and result
4. Assess:
   - Were input images good quality?
   - Is AI result actually poor?
   - Was it a technical failure?
5. Take action:
   - Refund credits if legitimate issue
   - Provide tips for better results
   - Log complaint for pattern analysis

### Compensating for Downtime

**Scenario**: System was down for 2 hours, affecting multiple users

**Steps**:
1. Identify affected users (check logs)
2. Prepare bulk credit adjustment CSV
3. Navigate to Credits > Bulk Adjustment
4. Upload CSV with compensation amount
5. Review and execute
6. Send communication email explaining compensation

### Dealing with Abusive Users

**Scenario**: User generating inappropriate content

**Steps**:
1. Review flagged jobs
2. Check user's full history
3. If confirmed violation:
   - Flag all inappropriate jobs
   - Issue warning email
   - If repeated: suspend account
4. Document in notes
5. Add to watch list

### Revenue Reconciliation

**Scenario**: Monthly revenue reconciliation

**Steps**:
1. Navigate to Payments
2. Generate payment report for the month
3. Export transactions
4. Compare with Razorpay settlement report
5. Investigate any discrepancies
6. Document findings

---

## Keyboard Shortcuts

Speed up your workflow with shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search users |
| `Ctrl + J` | Jump to jobs monitor |
| `Ctrl + P` | Open payments |
| `Ctrl + L` | View audit logs |
| `Ctrl + Shift + F` | Advanced filters |
| `Esc` | Close modals |

---

## Support & Escalation

### When to Escalate

Escalate to technical team when:

- System-wide technical issues
- Database problems
- Security breaches
- API integration failures
- Payment gateway issues

### Internal Support

- **Technical Issues**: tech@trailroom.com
- **Security Concerns**: security@trailroom.com
- **Policy Questions**: policy@trailroom.com

### External Support

- **Razorpay Support**: For payment gateway issues
- **Google AI Support**: For Gemini API issues
- **Hosting Provider**: For infrastructure issues

---

## Emergency Procedures

### System Outage

1. Notify technical team immediately
2. Check system status dashboard
3. Enable maintenance mode if needed
4. Communicate with affected users
5. Log all actions taken

### Security Breach

1. Immediately disable affected accounts/API keys
2. Notify security team
3. Block suspicious IPs
4. Review audit logs
5. Prepare incident report
6. Communicate with affected users after containment

### Payment Fraud

1. Suspend user account
2. Mark payment as disputed
3. Contact Razorpay support
4. Gather evidence
5. File report if needed
6. Block associated payment methods

---

## FAQ for Admins

**Q: Can I undo a credit adjustment?**
A: Yes, create an opposite adjustment with explanation.

**Q: How do I bulk suspend users?**
A: Use CSV import in User Management > Bulk Actions.

**Q: Can I preview a refund before processing?**
A: Yes, the refund modal shows preview before confirmation.

**Q: How long are audit logs kept?**
A: 1 year, then archived for compliance.

**Q: Can I recover a deleted job?**
A: No, deletions are permanent. Only suspend accounts, don't delete.

**Q: What's the best way to handle spam accounts?**
A: Suspend account, document reason, and add email domain to watch list if pattern detected.

**Q: How do I add another admin?**
A: Only super_admins can promote users. Open user profile > Change Role.

---

## Changelog

### Version 1.0 (December 2024)
- Initial admin panel release
- User management features
- Payment oversight
- Job monitoring
- Security dashboard
- Audit logging

---

**Need Admin Support?**

Contact: admin-support@trailroom.com

---

*Last Updated: December 2024*
*Admin Guide Version: 1.0*
