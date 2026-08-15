<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\UpsService;
use Illuminate\Http\Request;

class UPSCourierController extends Controller
{
    protected $ups;

    public function __construct(UpsService $ups)
    {
        $this->ups = $ups;
    }

    public function storeShipment(Request $request)
    {
        // 1. Validate clean incoming parameters from React
        $validated = $request->validate([
            'customer_name' => 'required|string',
            'address'       => 'required|string',
            'city'          => 'required|string',
            'state'         => 'required|string|max:2',
            'postal_code'   => 'required|string',
            'weight'        => 'required|numeric',
            'country'       => 'nullable|string|max:2',
        ]);

        $destinationCountry = strtoupper(trim((string) ($validated['country'] ?? 'US')));
        if ($destinationCountry === '') {
            $destinationCountry = 'US';
        }

        $originAddress = [
            "AddressLine" => [config('services.ups.origin_address_1', '123 Warehouse Rd')],
            "City" => config('services.ups.origin_city', 'New York'),
            "StateProvinceCode" => config('services.ups.origin_state', 'NY'),
            "PostalCode" => config('services.ups.origin_postal_code', '10001'),
            "CountryCode" => config('services.ups.origin_country', 'US')
        ];

        // 2. Format the strict payload expected by the UPS Shipping API
        $upsPayload = [
            "ShipmentRequest" => [
                "Request" => [
                    "RequestOption" => "nonvalidate"
                ],
                "Shipment" => [
                    "Description" => "E-Commerce Order Fulfillment",
                    "Shipper" => [
                        "Name" => config('services.ups.shipper_name', '1971Co'),
                        "ShipperNumber" => config('services.ups.shipper_number'), // Your 6-character UPS account number
                        "Address" => $originAddress
                    ],
                    "ShipFrom" => [
                        "Name" => config('services.ups.shipper_name', '1971Co'),
                        "Address" => $originAddress
                    ],
                    "ShipTo" => [
                        "Name" => $validated['customer_name'],
                        "Address" => [
                            "AddressLine" => [$validated['address']],
                            "City" => $validated['city'],
                            "StateProvinceCode" => $validated['state'],
                            "PostalCode" => $validated['postal_code'],
                            "CountryCode" => $destinationCountry
                        ]
                    ],
                    "Service" => [
                        "Code" => config('services.ups.service_code', '02'),
                        "Description" => config('services.ups.service_description', 'UPS 2nd Day Air')
                    ],
                    "PaymentInformation" => [
                        "ShipmentCharge" => [
                            "Type" => "01", // Bill to Shipper
                            "BillShipper" => [
                                "AccountNumber" => config('services.ups.shipper_number')
                            ]
                        ]
                    ],
                    "Package" => [
                        [
                            "Packaging" => [
                                "Code" => config('services.ups.packaging_code', '02'), // Customer Supplied Package / Box
                                "Description" => "Customer Box"
                            ],
                            "PackageWeight" => [
                                "UnitOfMeasurement" => [
                                    "Code" => "LBS",
                                    "Description" => "Pounds"
                                ],
                                "Weight" => (string) $validated['weight']
                            ]
                        ]
                    ]
                ],
                "LabelSpecification" => [
                    "LabelImageFormat" => [
                        "Code" => "GIF" // Returns a clean image string back to React
                    ]
                ]
            ]
        ];

        // 3. Dispatch straight to the UPS live panel
        try {
            $result = $this->ups->createShipment($upsPayload);
            
            // Extract the generated tracking number and label image string
            $trackingNumber = $result['ShipmentResponse']['ShipmentResults']['ShipmentIdentificationNumber'] ?? null;
            $labelGraphic   = $result['ShipmentResponse']['ShipmentResults']['PackageResults'][0]['ShippingLabel']['GraphicImage'] ?? null;

            return response()->json([
                'success' => true,
                'tracking_number' => $trackingNumber,
                'label_base64' => $labelGraphic
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}