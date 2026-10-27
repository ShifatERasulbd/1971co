@php
    $sections = [
        'Company Information' => [
            'Company Legal Name' => $application->company_legal_name,
            'DBA'                => $application->dba,
            "Owner's Name"       => $application->owner_name,
            'Website'            => $application->website,
        ],
        'Primary Contact Person' => [
            'Name'        => $application->contact_name,
            'Designation' => $application->contact_designation,
            'Email'       => $application->contact_email,
            'Phone'       => $application->contact_phone,
        ],
        'Business Location' => [
            'Street Address' => $application->street_address,
            'City'           => $application->city,
            'State'          => $application->state,
        ],
        'About the Business' => [
            'Primary Tangible Goods'   => $application->primary_goods,
            'Years in Business'        => $application->years_in_business,
            'Physical Stores'          => $application->physical_stores,
            '1st Year Projected Bookings' => $application->projected_year_1,
            '2nd Year Projected Bookings' => $application->projected_year_2,
            '3rd Year Projected Bookings' => $application->projected_year_3,
        ],
    ];
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Wholesale Request</title>
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
                                        <span style="font-size: 13px; color: #64748b; font-weight: 500;">Wholesale Request #{{ $application->id }}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Intro -->
                    <tr>
                        <td style="padding: 0 40px 24px 40px;">
                            <h2 style="font-size: 28px; font-family: Georgia, serif; font-weight: normal; color: #0f172a; margin-top: 0; margin-bottom: 16px; line-height: 1.2;">New wholesale request</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 8px 0;">
                                <strong>{{ $application->company_legal_name }}</strong> submitted a wholesale request on {{ $application->created_at->format('d M Y, H:i') }}. Reply to this email to respond to {{ $application->contact_name }} directly.
                            </p>
                        </td>
                    </tr>

                    <!-- Sections -->
                    @foreach($sections as $title => $rows)
                    <tr>
                        <td style="padding: 0 40px 28px 40px;">
                            <h4 style="font-size: 11px; text-transform: uppercase; color: #94a3b8; margin: 0 0 12px 0; letter-spacing: 1px; font-weight: 600;">{{ $title }}</h4>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #334155; line-height: 1.6;">
                                @foreach($rows as $label => $value)
                                    @if(filled($value))
                                    <tr>
                                        <td width="190" valign="top" style="color: #64748b; padding: 0 12px 6px 0;">{{ $label }}</td>
                                        <td valign="top" style="padding-bottom: 6px; font-weight: 500;">
                                            @if($label === 'Email')
                                                <a href="mailto:{{ $value }}" style="color: #0f172a;">{{ $value }}</a>
                                            @else
                                                {{ $value }}
                                            @endif
                                        </td>
                                    </tr>
                                    @endif
                                @endforeach
                            </table>
                        </td>
                    </tr>
                    @endforeach

                    <!-- Store description (cream) -->
                    <tr>
                        <td style="background-color: #f9f8f6; padding: 40px; border-top: 1px solid #eef0f2;">
                            <h3 style="font-size: 20px; font-family: Georgia, serif; font-weight: normal; color: #0f172a; margin-top: 0; margin-bottom: 16px;">About their store</h3>
                            <p style="font-size: 15px; line-height: 1.7; color: #334155; margin: 0 0 24px 0;">{!! nl2br(e($application->store_description)) !!}</p>

                            <a href="mailto:{{ $application->contact_email }}?subject={{ rawurlencode('Re: Your wholesale request') }}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to {{ $application->contact_name }}</a>
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