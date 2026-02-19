// FIREBASE SETUP
const firebaseConfig = {
    apiKey: "AIzaSyA-ZDGuvfGXZyQ-urgkvsH5z20VI3Wog3o",
    authDomain: "pricehunt-india.firebaseapp.com",
    projectId: "pricehunt-india",
    storageBucket: "pricehunt-india.firebasestorage.app",
    messagingSenderId: "192907609491",
    appId: "1:192907609491:web:cdfa4287f65e142db85466"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// STOCK STORAGE
let stocks = [];
let isOnline = navigator.onLine;

// BILL CART
let billCart = [];

// INITIAL LOAD
window.onload = function () {
    // Setup Real-time Listener
    setupFirebaseListener();

    // UI Helpers
    updateFields();
    checkShortage();

    const dateEl = document.getElementById("billDate");
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString();

    // Check online status
    window.addEventListener('online', () => { isOnline = true; setupFirebaseListener(); });
    window.addEventListener('offline', () => { isOnline = false; alert("You are offline. Changes may not save to cloud."); });
};

// MARK: - FIREBASE SYNC

function setupFirebaseListener() {
    // Doc Ref: appData/stocks
    const stockDocRef = db.collection("appData").doc("stocks");

    stockDocRef.onSnapshot((docSnap) => {
        if (docSnap.exists) {
            // Cloud data exists, update local
            stocks = docSnap.data().items || [];
            localStorage.setItem("stocks", JSON.stringify(stocks));
            renderStock();
            checkShortage();
        } else {
            // No cloud data, check if we have local data to upload (Migration)
            let localData = JSON.parse(localStorage.getItem("stocks")) || [];
            if (localData.length > 0) {
                console.log("Migrating local data to Cloud...");
                uploadToCloud(localData);
            } else {
                stocks = [];
                renderStock();
            }
        }
    }, (error) => {
        console.error("Sync Error:", error);
        // Fallback to local
        stocks = JSON.parse(localStorage.getItem("stocks")) || [];
        renderStock();
    });
}

function uploadToCloud(newData) {
    db.collection("appData").doc("stocks").set({ items: newData })
        .then(() => console.log("Cloud Updated"))
        .catch((e) => alert("Error saving to cloud: " + e.message));
}

// MARK: - STOCK MANAGEMENT

// THICKNESS & SIZE
function updateFields() {
    let category = document.getElementById("category").value;
    let thickness = document.getElementById("thickness");
    let size = document.getElementById("size");

    thickness.innerHTML = "";
    size.innerHTML = "";

    // Exact Logic requested by user
    if (category === "Door") {
        ["19BB", "25BB", "25mm", "30mm", "32mm", "35mm", "40mm", "45mm", "50mm"]
            .forEach(t => thickness.add(new Option(t)));
    } else if (category === "Bison Board") {
        ["6mm", "8mm", "10mm", "12mm", "16mm", "18mm", "20mm"]
            .forEach(t => thickness.add(new Option(t)));
    } else {
        ["3mm", "4mm", "6mm", "8mm", "12mm", "15mm", "16mm", "18mm", "19mm", "25mm"]
            .forEach(t => thickness.add(new Option(t)));
    }

    if (category === "HDMR") {
        size.add(new Option("8x4"));
    } else {
        ["8x4", "7x4", "6x4", "8x3", "7x3", "6x3", "8x2.5", "7x2.5", "6x2.5"]
            .forEach(s => size.add(new Option(s)));
    }
}

// SAVE STOCK
function saveStock() {
    let category = document.getElementById("category").value;
    let brand = document.getElementById("brand").value;
    let thickness = document.getElementById("thickness").value;
    let size = document.getElementById("size").value;
    let qty = parseInt(document.getElementById("qty").value);

    if (!qty || qty <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    // Add to local array immediately for UI responsiveness
    stocks.push({ category, brand, thickness, size, qty });

    // Sync to Cloud
    uploadToCloud(stocks);

    renderStock();
    checkShortage();

    // Reset inputs
    document.getElementById("qty").value = "";
    alert("Stock Added & Synced!");
}

// STOCK TABLE (With Partial Reduction)
function renderStock() {
    let table = document.getElementById("stockTable");

    if (!stocks.length) {
        table.innerHTML = "<tr><td colspan='6' class='text-center'>No stock available. Add some items!</td></tr>";
        return;
    }

    let html = `
    <thead>
    <tr>
        <th>Category</th>
        <th>Brand</th>
        <th>Thickness</th>
        <th>Size</th>
        <th>Qty</th>
        <th>Action</th>
    </tr>
    </thead>
    <tbody>`;

    stocks.forEach((s, i) => {
        html += `
        <tr>
            <td>${s.category}</td>
            <td>${s.brand}</td>
            <td>${s.thickness}</td>
            <td>${s.size}</td>
            <td style="font-weight:bold; color:${s.qty <= 5 ? 'red' : 'inherit'}">${s.qty}</td>
            <td>
                <div class="row-flex" style="gap:5px; justify-content:flex-start;">
                    <button class="secondary" style="margin:0; padding:5px 8px; width:auto; font-size:12px;" onclick="reduceStockQty(${i})">Reduce</button>
                    <button class="danger" style="margin:0; padding:5px 8px; width:auto; font-size:12px;" onclick="deleteStock(${i})">Delete</button>
                </div>
            </td>
        </tr>`;
    });

    html += "</tbody>";
    table.innerHTML = html;
}

// REDUCE STOCK (Partial)
function reduceStockQty(i) {
    let currentQty = stocks[i].qty;
    let reduceBy = prompt(`Current Qty: ${currentQty}\nHow many pieces to remove?`);

    if (reduceBy === null) return; // Cancelled

    let qtyToRemove = parseInt(reduceBy);

    if (isNaN(qtyToRemove) || qtyToRemove <= 0) {
        alert("Invalid quantity!");
        return;
    }

    if (qtyToRemove > currentQty) {
        alert("Cannot remove more than available quantity!");
        return;
    }

    stocks[i].qty -= qtyToRemove;

    if (stocks[i].qty === 0) {
        if (confirm("Quantity is 0. Delete this item?")) {
            stocks.splice(i, 1);
        }
    }

    uploadToCloud(stocks);
    renderStock();
}

// DELETE STOCK
function deleteStock(i) {
    if (confirm("Are you sure you want to delete this stock item?")) {
        stocks.splice(i, 1);
        uploadToCloud(stocks);
        renderStock();
    }
}

// LOW STOCK ALERT
function checkShortage() {
    let msg = "";
    stocks.forEach(s => {
        if (s.qty <= 5) {
            msg += `⚠️ LOW STOCK: ${s.brand} ${s.thickness} ${s.size} (Qty: ${s.qty})<br>`;
        }
    });
    document.getElementById("alertBox").innerHTML = msg;
}

// SEARCH STOCK
function searchStock() {
    let input = document.getElementById("searchBrand").value.toUpperCase();
    let table = document.getElementById("stockTable");
    let tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        // Search in Brand(1), Thickness(2), Size(3)
        let brand = tr[i].getElementsByTagName("td")[1];
        let thick = tr[i].getElementsByTagName("td")[2];
        let size = tr[i].getElementsByTagName("td")[3];

        if (brand || thick || size) {
            let txtValue = (brand.textContent || brand.innerText) + " " + (thick.textContent || thick.innerText) + " " + (size.textContent || size.innerText);
            if (txtValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// DASHBOARD NAVIGATION
function showStock() {
    switchSection("stockDashboard");
    renderStock();
}

function goBack() {
    switchSection("mainDashboard");
}

function showBilling() {
    switchSection("billingDashboard");
    loadBillStock();
    // Reset Cart
    billCart = [];
    renderCart();
    document.getElementById("billOutput").innerHTML = "";
    document.getElementById("partyName").value = "";
    document.getElementById("whatsappNumber").value = "";
}

function goBackFromBill() {
    if (billCart.length > 0 && !confirm("You have items in your cart. Are you sure you want to exit?")) {
        return;
    }
    switchSection("mainDashboard");
}

function showBills() {
    switchSection("billsDashboard");
    renderBillHistory();
}

function backFromBills() {
    switchSection("mainDashboard");
}

// Helper for Switching Sections
function switchSection(id) {
    document.querySelectorAll(".container").forEach(div => div.style.display = "none");
    document.getElementById(id).style.display = "block";
    window.scrollTo(0, 0);
}


// MARK: - BILLING LOGIC

// LOAD BILL STOCK DROPDOWN
function loadBillStock() {
    let select = document.getElementById("billStock");
    // let currentVal = select.value;
    select.innerHTML = "";

    if (stocks.length === 0) {
        select.innerHTML = "<option>No Stock Available</option>";
        return;
    }

    stocks.forEach((s, i) => {
        let displayText = `${s.brand} - ${s.thickness} - ${s.size} (Avail: ${s.qty})`;
        select.add(new Option(displayText, i));
    });
}

// SIZE CONVERSION (Meters)
function sizeToMeter(val) {
    const map = { "8": 2.44, "7": 2.14, "6": 1.84, "4": 1.22, "3": 0.92, "2.5": 0.77, "2": 0.61 };
    return map[val] || 0;
}

// CALCULATE ITEM PRICE
function calculatePrice(stk, qty, rate, type) {
    let dims = stk.size.split("x");
    let length = sizeToMeter(dims[0]);
    let width = sizeToMeter(dims[1]);

    let amount = 0;

    if (type === "pcs") {
        amount = rate * qty;
    } else if (type === "sqft") {
        // Area in Sq Meter * 10.764 = Sq Feet
        let areaSqM = length * width;
        let areaSqFt = areaSqM * 10.764;
        amount = rate * areaSqFt * qty;
    } else { // sqm
        let areaSqM = length * width;
        amount = rate * areaSqM * qty;
    }

    return amount;
}

// ADD TO CART
function addToCart() {
    let stockIndex = document.getElementById("billStock").value;
    let qty = parseFloat(document.getElementById("billQty").value);
    let rate = parseFloat(document.getElementById("rate").value);
    let type = document.getElementById("rateType").value;

    if (stocks.length === 0) { alert("No stock available"); return; }
    if (!qty || qty <= 0) { alert("Invalid Quantity"); return; }
    if (!rate || rate <= 0) { alert("Invalid Rate"); return; }

    let stockItem = stocks[stockIndex];

    // Check availability (Considering items already in cart!)
    let currentInCart = billCart.filter(item => item.stockIndex == stockIndex).reduce((sum, item) => sum + item.qty, 0);

    if ((currentInCart + qty) > stockItem.qty) {
        alert(`Insufficient Stock! Available: ${stockItem.qty}, In Cart: ${currentInCart}`);
        return;
    }

    let totalAmt = calculatePrice(stockItem, qty, rate, type);

    billCart.push({
        stockIndex: stockIndex,
        brand: stockItem.brand,
        desc: `${stockItem.thickness} ${stockItem.size}`,
        qty: qty,
        rate: rate,
        type: type,
        total: totalAmt
    });

    renderCart();

    // Clear inputs for next item
    document.getElementById("billQty").value = "";
    document.getElementById("rate").value = "";
}

// RENDER CART
function renderCart() {
    let tbody = document.getElementById("cartBody");
    let subtotalEl = document.getElementById("cartSubtotal");

    tbody.innerHTML = "";
    let subtotal = 0;

    billCart.forEach((item, index) => {
        subtotal += item.total;
        tbody.innerHTML += `
            <tr>
                <td>${item.brand} <br> <small>${item.desc}</small></td>
                <td>${item.qty}</td>
                <td>Rs. ${item.total.toFixed(2)}</td>
                <td><button class="danger" style="margin:0; padding:5px;" onclick="removeFromCart(${index})">X</button></td>
            </tr>
        `;
    });

    subtotalEl.innerText = subtotal.toFixed(2);
}

// REMOVE FROM CART
function removeFromCart(index) {
    billCart.splice(index, 1);
    renderCart();
}

// GENERATE FINAL BILL
function generateBill() {
    if (billCart.length === 0) {
        alert("Cart is empty! Add items first.");
        return;
    }

    let party = document.getElementById("partyName").value || "Cash Customer";
    let whatsapp = document.getElementById("whatsappNumber").value;
    let gst = document.getElementById("gstCheck").checked;
    let carriage = parseFloat(document.getElementById("carriage").value) || 0;
    let unloading = parseFloat(document.getElementById("unloading").value) || 0;
    let discountPercent = parseFloat(document.getElementById("discount").value) || 0;

    // Calculate Totals
    let materialTotal = billCart.reduce((sum, item) => sum + item.total, 0);
    let discountAmt = materialTotal * (discountPercent / 100);
    let afterDiscount = materialTotal - discountAmt;
    let gstAmt = gst ? (afterDiscount * 0.18) : 0;
    let finalTotal = afterDiscount + gstAmt + carriage + unloading;

    // 1. DEDUCT STOCK (Update Local + Cloud)
    // We update the local 'stocks' array first, then push the whole array to cloud
    // This is safer for concurrency in this simple model than individual updates
    billCart.forEach(item => {
        if (stocks[item.stockIndex]) {
            stocks[item.stockIndex].qty -= item.qty;
        }
    });

    uploadToCloud(stocks);
    renderStock();

    // 2. SAVE BILL HISTORY
    // Create a summary string for legacy support
    let summaryStr = billCart.length === 1
        ? `${billCart[0].brand} ${billCart[0].desc}`
        : `${billCart.length} Items (Total Qty: ${billCart.reduce((a, b) => a + b.qty, 0)})`;

    let billData = {
        date: new Date().toLocaleString(),
        party: party,
        material: summaryStr, // Legacy Field
        items: billCart,      // New Field
        qty: billCart.reduce((a, b) => a + b.qty, 0),
        total: finalTotal,
        gstAmt: gstAmt,
        discountAmt: discountAmt,
        carriage: carriage,
        unloading: unloading
    };

    saveBillHistory(billData);

    // 3. SHOW OUTPUT
    let billHtml = `
    <div style="background:#fff; padding:20px; border:1px solid #ccc; font-family:'Segoe UI', sans-serif;">
        <h2 style="text-align:center; color:#4a3b2a; margin-bottom:5px;">VPLY CENTRE</h2>
        <p style="text-align:center; margin-top:0;">Plywood & Hardware</p>
        <hr style="border-top: 1px dashed #ccc;">
        
        <div style="display:flex; justify-content:space-between;">
            <p><strong>Party:</strong> ${party}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <table style="width:100%; border-collapse:collapse; margin:15px 0;">
            <tr style="background:#eee; text-align:left;">
                <th style="padding:8px; border-bottom:1px solid #ddd;">Item</th>
                <th style="padding:8px; text-align:right;">Qty</th>
                <th style="padding:8px; text-align:right;">Rate</th>
                <th style="padding:8px; text-align:right;">Total</th>
            </tr>
    `;

    billCart.forEach(item => {
        billHtml += `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">
                    ${item.brand}<br><small>${item.desc}</small>
                </td>
                <td style="padding:8px; text-align:right;">${item.qty}</td>
                <td style="padding:8px; text-align:right;">${item.rate}/${item.type}</td>
                <td style="padding:8px; text-align:right;">${item.total.toFixed(0)}</td>
            </tr>
        `;
    });

    billHtml += `
        </table>
        
        <div style="text-align:right; line-height:1.6;">
            <p>Subtotal: <strong>Rs. ${materialTotal.toFixed(2)}</strong></p>
            ${discountAmt > 0 ? `<p>Discount (${discountPercent}%): -${discountAmt.toFixed(2)}</p>` : ''}
            ${gstAmt > 0 ? `<p>GST (18%): +${gstAmt.toFixed(2)}</p>` : ''}
            ${carriage > 0 ? `<p>Carriage: +${carriage}</p>` : ''}
            ${unloading > 0 ? `<p>Unloading: +${unloading}</p>` : ''}
            <h3 style="color:#8b5a2b; border-top:2px solid #ddd; padding-top:10px;">
                Grand Total: Rs. ${finalTotal.toFixed(2)}
            </h3>
        </div>

        <div class="row-flex" style="margin-top:20px;">
            <button onclick="window.print()">Print Invoice</button>
            <button onclick="sendWhatsAppBill('${party}', ${finalTotal.toFixed(2)})" style="background:#25D366;">Share via WhatsApp</button>
        </div>
        <button class="secondary" onclick="showBilling()" style="margin-top:10px;">New Bill</button>
    </div>
    `;

    document.getElementById("billOutput").innerHTML = billHtml;

    // Auto scroll to bill
    document.getElementById("billOutput").scrollIntoView({ behavior: "smooth" });
}

// SAVE BILL HISTORY
function saveBillHistory(data) {
    let bills = JSON.parse(localStorage.getItem("bills")) || [];
    bills.unshift(data); // Add new bill to top
    localStorage.setItem("bills", JSON.stringify(bills));
}

// RENDER HISTORY
function renderBillHistory() {
    let bills = JSON.parse(localStorage.getItem("bills")) || [];
    let table = document.getElementById("billsTable");

    if (!bills.length) {
        table.innerHTML = "<tr><td colspan='5' class='text-center'>No History Found</td></tr>";
        return;
    }

    table.innerHTML = `
        <thead>
            <tr>
                <th>Date</th>
                <th>Party</th>
                <th>Summary</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
    `;

    bills.forEach(b => {
        table.innerHTML += `
            <tr>
                <td>${b.date}</td>
                <td>${b.party}</td>
                <td>${b.material || 'Multi-Item Bill'}</td>
                <td>Rs. ${b.total.toFixed(2)}</td>
            </tr>
        `;
    });
    table.innerHTML += "</tbody>";
}


// MARK: - WHATSAPP INTEGRATION

function sendWhatsAppBill(partyName, totalAmount) {
    let number = document.getElementById("whatsappNumber").value;

    // INVOICE FORMATTING
    // Using simple spacing and newlines as WhatsApp doesn't support advanced tables

    let msg = `*VPLY CENTRE - INVOICE*%0a`;
    msg += `Date: ${new Date().toLocaleDateString()}%0a`;
    msg += `Party: *${partyName}*%0a`;
    msg += `--------------------------------%0a`;

    billCart.forEach((item, i) => {
        // Line 1: Item Name
        msg += `${i + 1}. *${item.brand}* ${item.desc}%0a`;
        // Line 2: Details
        msg += `   ${item.qty} x ${item.rate}/${item.type} = Rs. ${item.total.toFixed(0)}%0a`;
    });

    msg += `--------------------------------%0a`;

    let subtotal = billCart.reduce((s, i) => s + i.total, 0);
    // You can add discount/gst details here if needed, but keeping it clean for now

    msg += `*TOTAL PAYABLE: Rs. ${totalAmount}*%0a`;
    msg += `--------------------------------%0a`;
    msg += `Thank you for your business!`;

    if (number) {
        // Remove spaces or dashes
        number = number.replace(/\D/g, '');
        // Add 91 if missing
        if (number.length === 10) number = "91" + number;

        window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
    } else {
        alert("Please enter a WhatsApp number to send.");
    }
}

// Placeholder for Excel Upload in case older browsers trigger it
function handleExcelUpload(event) {
    alert("Excel upload requires conversion logic. Please use manual entry for now.");
}
