<!DOCTYPE html>

<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; padding: 40px 20px; color: #18181b; margin: 0;">

```
<!-- Outer wrapper table to prevent Gmail client clipping (collapsing into ellipsis/3 dots) -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
    <tr>
        <td align="center" style="padding: 0;">

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px; background-color: #ffffff;">
                <tr>
                    <td style="padding: 0;">

                        <!-- App Icon / Logo -->
                        <div style="margin-bottom: 32px;">
                            <img
                                src="https://1971co.com/mail_logo.png"
                                alt="1971Co"
                                height="28"
                                style="display: block; max-height: 28px; object-fit: contain;"
                            >
                        </div>

                        <!-- Heading -->
                        <h2 style="font-size: 24px; font-weight: 700; color: #111111; margin: 0 0 16px 0; letter-spacing: -0.5px;">
                            Verification code
                        </h2>

                        <!-- Description -->
                        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 24px 0; line-height: 1.5;">
                            Enter the following verification code when prompted:
                        </p>

                        <!-- OTP Code Block -->
                        <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111111; margin: 0 0 16px 0;">
                            {{ $otp }}
                        </div>

                        <!-- Security Message -->
                        <p style="font-size: 14px; font-weight: 600; color: #18181b; margin: 0; line-height: 1.5;">
                            To protect your account, do not share this code.
                        </p>

                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>
```

</body>

</html>
