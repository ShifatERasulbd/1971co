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
        ]);

        // 2. Format the strict payload expected by the UPS Shipping API
        $upsPayload = [
            "ShipmentRequest" => [
                "Request" => [
                    "RequestOption" => "nonvalidate"
                ],
                "Shipment" => [
                    "Description" => "E-Commerce Order Fulfillment",
                    "Shipper" => [
                        "Name" => "Your Company Name",
                        "ShipperNumber" => config('services.ups.shipper_number'), // Your 6-character UPS account number
                        "Address" => [
                            "AddressLine" => ["123 Warehouse Rd"],
                            "City" => "Warehouse City",
                            "StateProvinceCode" => "TX",
                            "PostalCode" => "75001",
                            "CountryCode" => "US"
                        ]
                    ],
                    "ShipTo" => [
                        "Name" => $validated['customer_name'],
                        "Address" => [
                            "AddressLine" => [$validated['address']],
                            "City" => $validated['city'],
                            "StateProvinceCode" => $validated['state'],
                            "PostalCode" => $validated['postal_code'],
                            "CountryCode" => "US"
                        ]
                    ],
                    "Service" => [
                        "Code" => "03", // "03" stands for UPS Ground
                        "Description" => "UPS Ground"
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
                                "Code" => "02", // Customer Supplied Package / Box
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