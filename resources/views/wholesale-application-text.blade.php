New wholesale request #{{ $application->id }}
{{ $application->company_legal_name }} - {{ $application->created_at->format('d M Y, H:i') }}

COMPANY
Legal Name: {{ $application->company_legal_name }}
@if($application->dba)DBA: {{ $application->dba }}
@endif
Owner: {{ $application->owner_name }}
@if($application->website)Website: {{ $application->website }}
@endif

PRIMARY CONTACT
Name: {{ $application->contact_name }}
@if($application->contact_designation)Designation: {{ $application->contact_designation }}
@endif
Email: {{ $application->contact_email }}
@if($application->contact_phone)Phone: {{ $application->contact_phone }}
@endif

LOCATION
{{ $application->street_address }}, {{ $application->city }}, {{ $application->state }}

BUSINESS
Primary goods: {{ $application->primary_goods }}
Years in business: {{ $application->years_in_business }}
@if($application->physical_stores)Physical stores: {{ $application->physical_stores }}
@endif
Projected bookings: Y1 {{ $application->projected_year_1 }} | Y2 {{ $application->projected_year_2 }} | Y3 {{ $application->projected_year_3 }}

ABOUT THEIR STORE
{{ $application->store_description }}