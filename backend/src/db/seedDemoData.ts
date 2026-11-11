import pool from "./connection";

interface SeedCustomer {
    name: string;
    mobile: string;
    email: string;
    business_name: string;
    gst_number: string;
    customer_type: "Retail" | "Wholesale" | "Distributor";
    address: string;
    status: "Lead" | "Active" | "Inactive";
    notes: string;
}

interface SeedProduct {
    name: string;
    sku: string;
    category: string;
    unit_price: number;
    current_stock: number;
    minimum_stock: number;
    warehouse_location: string;
}

const SAMPLE_CUSTOMERS: SeedCustomer[] = [
    {
        name: "Aarav Mehta",
        mobile: "+91 98201 45210",
        email: "aarav@mehtainfotech.in",
        business_name: "Mehta Infotech Solutions",
        gst_number: "27AABCM1234F1Z5",
        customer_type: "Wholesale",
        address: "Shop 14, Lamington Road, Grant Road East, Mumbai, Maharashtra 400007",
        status: "Active",
        notes: "Regular bulk buyer for laptops, SSDs, and GPUs."
    },
    {
        name: "Priya Nair",
        mobile: "+91 98450 77321",
        email: "priya@siliconvalleycomp.in",
        business_name: "Silicon Valley Computers",
        gst_number: "29AADCS5678G1Z2",
        customer_type: "Distributor",
        address: "No. 42, SP Road, Chickpet, Bengaluru, Karnataka 560002",
        status: "Active",
        notes: "South India distribution partner for PC components."
    },
    {
        name: "Rohan Sharma",
        mobile: "+91 98112 33490",
        email: "rohan@capitaltechhub.in",
        business_name: "Capital Tech Hub",
        gst_number: "07AAECC9012H1Z9",
        customer_type: "Retail",
        address: "B-18, Nehru Place Market, New Delhi, Delhi 110019",
        status: "Active",
        notes: "Nehru Place showroom; orders custom PC builds and RAM."
    },
    {
        name: "Sneha Reddy",
        mobile: "+91 90001 88214",
        email: "sneha@deccandigital.in",
        business_name: "Deccan Digital World",
        gst_number: "36AAFCD3456J1Z4",
        customer_type: "Wholesale",
        address: "Plot 9, Chenoy Trade Centre, Park Lane, Secunderabad, Hyderabad, Telangana 500003",
        status: "Active",
        notes: "Corporate workstation and smartphone procurement."
    },
    {
        name: "Karthik Subramanian",
        mobile: "+91 94440 61209",
        email: "karthik@marinaelectronics.in",
        business_name: "Marina Electronics & IT",
        gst_number: "33AABGM7890K1Z1",
        customer_type: "Retail",
        address: "27, Ritchie Street, Mount Road, Chennai, Tamil Nadu 600002",
        status: "Lead",
        notes: "Requested quote for RTX 4070 Super and NVMe SSDs."
    },
    {
        name: "Devika Chatterjee",
        mobile: "+91 98300 54182",
        email: "devika@bengalbytes.in",
        business_name: "Bengal Byte Systems",
        gst_number: "19AAHCB2345L1Z8",
        customer_type: "Wholesale",
        address: "11, Ganesh Chandra Avenue, Chandni Chowk, Kolkata, West Bengal 700013",
        status: "Active",
        notes: "East India reseller for enterprise laptops and storage."
    },
    {
        name: "Harsh Patel",
        mobile: "+91 98250 19843",
        email: "harsh@sabarmatihardware.in",
        business_name: "Sabarmati Hardware Mart",
        gst_number: "24AAICS6789M1Z3",
        customer_type: "Distributor",
        address: "305, Relief Road Electronics Plaza, Ahmedabad, Gujarat 380001",
        status: "Active",
        notes: "Monthly standing order for DDR5 RAM and NVMe drives."
    },
    {
        name: "Vikram Rathore",
        mobile: "+91 94140 72655",
        email: "vikram@pinkcitygadgets.in",
        business_name: "PinkCity Gadgets & IT",
        gst_number: "08AAJCP4567N1Z6",
        customer_type: "Retail",
        address: "48, Raisar Plaza, Indira Bazar, Jaipur, Rajasthan 302001",
        status: "Inactive",
        notes: "Paused orders until Q4 store expansion."
    }
];

const SAMPLE_PRODUCTS: SeedProduct[] = [
    {
        name: "Apple iPhone 16 Pro (256GB, Natural Titanium)",
        sku: "PHN-APL-16P-256",
        category: "Smartphones",
        unit_price: 119900,
        current_stock: 18,
        minimum_stock: 5,
        warehouse_location: "Rack A1 - Mumbai Hub"
    },
    {
        name: "Samsung Galaxy S24 Ultra 5G (512GB, Titanium Gray)",
        sku: "PHN-SAM-S24U-512",
        category: "Smartphones",
        unit_price: 129999,
        current_stock: 14,
        minimum_stock: 5,
        warehouse_location: "Rack A2 - Mumbai Hub"
    },
    {
        name: "OnePlus 13 5G (16GB / 512GB, Midnight Ocean)",
        sku: "PHN-ONP-13-512",
        category: "Smartphones",
        unit_price: 76999,
        current_stock: 25,
        minimum_stock: 8,
        warehouse_location: "Rack A3 - Bengaluru Hub"
    },
    {
        name: "Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz",
        sku: "RAM-COR-32G-D5",
        category: "RAM",
        unit_price: 10499,
        current_stock: 42,
        minimum_stock: 10,
        warehouse_location: "Rack B1 - Bengaluru Hub"
    },
    {
        name: "Kingston Fury Beast 16GB DDR4 3200MHz",
        sku: "RAM-KIN-16G-D4",
        category: "RAM",
        unit_price: 3499,
        current_stock: 65,
        minimum_stock: 15,
        warehouse_location: "Rack B2 - Delhi Hub"
    },
    {
        name: "NVIDIA GeForce RTX 4070 Super 12GB GDDR6X",
        sku: "GPU-NVD-4070S-12G",
        category: "Graphics Cards",
        unit_price: 58500,
        current_stock: 6,
        minimum_stock: 8,
        warehouse_location: "Rack C1 - Bengaluru Hub"
    },
    {
        name: "AMD Radeon RX 7800 XT 16GB GDDR6",
        sku: "GPU-AMD-7800XT-16G",
        category: "Graphics Cards",
        unit_price: 49900,
        current_stock: 11,
        minimum_stock: 5,
        warehouse_location: "Rack C2 - Mumbai Hub"
    },
    {
        name: "NVIDIA GeForce RTX 4060 8GB OC Edition",
        sku: "GPU-NVD-4060-8G",
        category: "Graphics Cards",
        unit_price: 29999,
        current_stock: 19,
        minimum_stock: 6,
        warehouse_location: "Rack C3 - Delhi Hub"
    },
    {
        name: "Samsung 990 PRO 1TB PCIe 4.0 NVMe M.2 SSD",
        sku: "SSD-SAM-990P-1T",
        category: "SSDs",
        unit_price: 9499,
        current_stock: 50,
        minimum_stock: 12,
        warehouse_location: "Rack D1 - Hyderabad Hub"
    },
    {
        name: "WD Black SN850X 2TB NVMe Gen4 SSD",
        sku: "SSD-WDB-850X-2T",
        category: "SSDs",
        unit_price: 15999,
        current_stock: 4,
        minimum_stock: 8,
        warehouse_location: "Rack D2 - Hyderabad Hub"
    },
    {
        name: "Apple MacBook Pro 14\" M4 (16GB / 512GB)",
        sku: "LPT-APL-MBP14-M4",
        category: "Laptops",
        unit_price: 169900,
        current_stock: 9,
        minimum_stock: 4,
        warehouse_location: "Rack E1 - Mumbai Hub"
    },
    {
        name: "Lenovo ThinkPad X1 Carbon Gen 12 (Ultra 7 / 32GB / 1TB)",
        sku: "LPT-LEN-X1C-G12",
        category: "Laptops",
        unit_price: 154500,
        current_stock: 7,
        minimum_stock: 3,
        warehouse_location: "Rack E2 - Bengaluru Hub"
    },
    {
        name: "Dell XPS 13 9340 (Core Ultra 7 / 16GB / 512GB)",
        sku: "LPT-DEL-XPS13-9340",
        category: "Laptops",
        unit_price: 139900,
        current_stock: 12,
        minimum_stock: 4,
        warehouse_location: "Rack E3 - Delhi Hub"
    }
];

interface SeedChallanSpec {
    challanNumber: string;
    customerBusiness: string;
    status: "Draft" | "Confirmed" | "Cancelled";
    items: Array<{ sku: string; quantity: number }>;
}

const SAMPLE_CHALLANS: SeedChallanSpec[] = [
    {
        challanNumber: "CHL-2026-1001",
        customerBusiness: "Mehta Infotech Solutions",
        status: "Confirmed",
        items: [
            { sku: "PHN-APL-16P-256", quantity: 3 },
            { sku: "LPT-APL-MBP14-M4", quantity: 2 }
        ]
    },
    {
        challanNumber: "CHL-2026-1002",
        customerBusiness: "Silicon Valley Computers",
        status: "Confirmed",
        items: [
            { sku: "RAM-COR-32G-D5", quantity: 8 },
            { sku: "SSD-SAM-990P-1T", quantity: 10 },
            { sku: "GPU-NVD-4070S-12G", quantity: 2 }
        ]
    },
    {
        challanNumber: "CHL-2026-1003",
        customerBusiness: "Capital Tech Hub",
        status: "Draft",
        items: [
            { sku: "GPU-NVD-4060-8G", quantity: 4 },
            { sku: "RAM-KIN-16G-D4", quantity: 12 }
        ]
    },
    {
        challanNumber: "CHL-2026-1004",
        customerBusiness: "Deccan Digital World",
        status: "Confirmed",
        items: [
            { sku: "PHN-SAM-S24U-512", quantity: 2 },
            { sku: "LPT-LEN-X1C-G12", quantity: 2 },
            { sku: "SSD-WDB-850X-2T", quantity: 3 }
        ]
    },
    {
        challanNumber: "CHL-2026-1005",
        customerBusiness: "Bengal Byte Systems",
        status: "Draft",
        items: [
            { sku: "LPT-DEL-XPS13-9340", quantity: 3 },
            { sku: "PHN-ONP-13-512", quantity: 4 }
        ]
    }
];

export const seedDemoData = async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const userResult = await client.query(
            "SELECT id, email FROM users WHERE email IN ('admin@fourclover.com', 'sales@fourclover.com')"
        );
        const adminId = userResult.rows.find((u) => u.email === "admin@fourclover.com")?.id ?? userResult.rows[0]?.id;
        const salesId = userResult.rows.find((u) => u.email === "sales@fourclover.com")?.id ?? adminId;

        if (!adminId) {
            await client.query("ROLLBACK");
            return;
        }

        const customerCount = (await client.query("SELECT COUNT(*)::int AS count FROM customers")).rows[0].count;
        if (customerCount === 0) {
            for (const c of SAMPLE_CUSTOMERS) {
                await client.query(
                    `INSERT INTO customers
                    (name, mobile, email, business_name, gst_number, customer_type, address, status, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [c.name, c.mobile, c.email, c.business_name, c.gst_number, c.customer_type, c.address, c.status, c.notes]
                );
            }
            console.log(`✅ Seeded ${SAMPLE_CUSTOMERS.length} Indian customers`);
        }

        const productCount = (await client.query("SELECT COUNT(*)::int AS count FROM products")).rows[0].count;
        if (productCount === 0) {
            for (const p of SAMPLE_PRODUCTS) {
                const inserted = await client.query(
                    `INSERT INTO products
                    (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id`,
                    [p.name, p.sku, p.category, p.unit_price, p.current_stock, p.minimum_stock, p.warehouse_location]
                );

                await client.query(
                    `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
                     VALUES ($1, $2, 'IN', 'Initial Demo Stock Import', $3)`,
                    [inserted.rows[0].id, p.current_stock, adminId]
                );
            }
            console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} electronics products`);
        }

        const challanCount = (await client.query("SELECT COUNT(*)::int AS count FROM challans")).rows[0].count;
        if (challanCount === 0) {
            const customersMap = new Map<string, number>();
            const allCustomers = await client.query("SELECT id, business_name FROM customers");
            for (const row of allCustomers.rows) {
                customersMap.set(row.business_name, row.id);
            }

            const productsMap = new Map<string, { id: number; name: string; sku: string; unit_price: string }>();
            const allProducts = await client.query("SELECT id, name, sku, unit_price FROM products");
            for (const row of allProducts.rows) {
                productsMap.set(row.sku, row);
            }

            for (const spec of SAMPLE_CHALLANS) {
                const customerId = customersMap.get(spec.customerBusiness);
                if (!customerId) continue;

                const resolvedItems = spec.items
                    .map((item) => {
                        const product = productsMap.get(item.sku);
                        return product ? { product, quantity: item.quantity } : null;
                    })
                    .filter((item): item is { product: { id: number; name: string; sku: string; unit_price: string }; quantity: number } => item !== null);

                if (resolvedItems.length === 0) continue;

                const totalQuantity = resolvedItems.reduce((sum, item) => sum + item.quantity, 0);
                const challanResult = await client.query(
                    `INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (challan_number) DO NOTHING
                     RETURNING id`,
                    [spec.challanNumber, customerId, totalQuantity, spec.status, salesId]
                );

                if (challanResult.rows.length === 0) continue;
                const challanId = challanResult.rows[0].id;

                for (const { product, quantity } of resolvedItems) {
                    await client.query(
                        `INSERT INTO challan_items
                        (challan_id, product_id, product_name_snapshot, product_sku_snapshot, product_price_snapshot, quantity)
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        [challanId, product.id, product.name, product.sku, product.unit_price, quantity]
                    );

                    if (spec.status === "Confirmed") {
                        await client.query(
                            `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
                             VALUES ($1, $2, 'OUT', $3, $4)`,
                            [product.id, quantity, `Sales Challan Confirmed: ${spec.challanNumber}`, salesId]
                        );
                    }
                }
            }
            console.log(`✅ Seeded ${SAMPLE_CHALLANS.length} sample challans`);
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error seeding demo data:", error);
        throw error;
    } finally {
        client.release();
    }
};

