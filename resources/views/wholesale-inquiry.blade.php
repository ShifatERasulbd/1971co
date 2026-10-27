<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Wholesale Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f0eb; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f3f0eb; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">

                    <!-- Header -->
                    <tr>
                        <td align="left" style="padding: 40px 40px 20px 40px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <img src="https://1971co.com/mail_logo.png" alt="1971Co" height="28" style="display: block; max-height: 28px; object-fit: contain;">
                                    </td>
                                    <td align="right">
                                        <span style="font-size: 13px; color: #64748b; font-weight: 500;">Wholesale Inquiry</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Intro -->
                    <tr>
                        <td style="padding: 0 40px 24px 40px;">
                            <h2 style="font-size: 28px; font-family: Georgia, serif; font-weight: normal; color: #0f172a; margin-top: 0; margin-bottom: 16px; line-height: 1.2;">New wholesale inquiry</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                                {{ $inquiry->name }} sent a message through the Wholesale page. Reply to this email to respond directly.
                            </p>
                        </td>
                    </tr>

                    <!-- Contact Details -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px;">
                            <h4 style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin: 0 0 12px 0; letter-spacing: 1px; font-weight: 600;">Contact Details</h4>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #334155; line-height: 1.6;">
                                <tr>
                                    <td width="100" style="color: #64748b; padding-bottom: 4px;">Name</td>
                                    <td style="padding-bottom: 4px; font-weight: 500;">{{ $inquiry->name }}</td>
                                </tr>
                                <tr>
                                    <td style="color: #64748b; padding-bottom: 4px;">Email</td>
                                    <td style="padding-bottom: 4px;"><a href="mailto:{{ $inquiry->email }}" style="color: #0f172a;">{{ $inquiry->email }}</a></td>
                                </tr>
                                @if(!empty($inquiry->phone))
                                <tr>
                                    <td style="color: #64748b; padding-bottom: 4px;">Phone</td>
                                    <td style="padding-bottom: 4px;">{{ $inquiry->phone }}</td>
                                </tr>
                                @endif
                                @if(!empty($inquiry->category))
                                <tr>
                                    <td style="color: #64748b; padding-bottom: 4px;">Category</td>
                                    <td style="padding-bottom: 4px;">{{ $inquiry->category }}</td>
                                </tr>
                                @endif
                                @if(!empty($inquiry->attachment_name))
                                <tr>
                                    <td style="color: #64748b; padding-bottom: 4px;">Attachment</td>
                                    <td style="padding-bottom: 4px;">{{ $inquiry->attachment_name }} (attached)</td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>

                    <!-- Message (cream) -->
                    <tr>
                        <td style="background-color: #f9f8f6; padding: 40px; border-top: 1px solid #eef0f2;">
                            <h3 style="font-size: 20px; font-family: Georgia, serif; font-weight: normal; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
                                {{ $inquiry->subject ?: 'Message' }}
                            </h3>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
                                <tr>
                                    <td>
                                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Received</span><br>
                                        <span style="font-size: 14px; color: #0f172a; font-weight: 500;">{{ optional($inquiry->created_at)->format('d M Y, H:i') ?? date('d M Y, H:i') }}</span>
                                    </td>
                                    <td align="right">
                                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Reference</span><br>
                                        <span style="font-size: 14px; color: #0f172a; font-weight: 500;">#{{ $inquiry->id }}</span>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 24px 0;">{!! nl2br(e($inquiry->message)) !!}</p>

                            <a href="mailto:{{ $inquiry->email }}?subject={{ rawurlencode('Re: ' . ($inquiry->subject ?: 'Your wholesale inquiry')) }}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to {{ $inquiry->name }}</a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #ffffff; padding: 24px 40px; border-top: 1px solid #eef0f2;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <img src="https://1971co.com/mail_logo.png" alt="1971Co" height="20" style="display: block; max-height: 20px; object-fit: contain;">
                                    </td>
                                    <td align="right">
                                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                                            &copy; {{ date('Y') }} 1971Co. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>