// STOCK STORAGE
let stocks = JSON.parse(localStorage.getItem("stocks")) || [];

// INITIAL LOAD
window.onload = function(){
updateFields();
renderStock();
checkShortage();
};

// THICKNESS & SIZE
function updateFields(){
let category=document.getElementById("category").value;
let thickness=document.getElementById("thickness");
let size=document.getElementById("size");

thickness.innerHTML="";
size.innerHTML="";

if(category==="Door"){
["19BB","25BB","25mm","30mm","35mm","40mm","45mm","50mm"]
.forEach(t=>thickness.add(new Option(t)));
}else if(category==="Bison Board"){
["6mm","8mm","12mm","16mm","18mm"]
.forEach(t=>thickness.add(new Option(t)));
}else{
["4mm","6mm","8mm","12mm","16mm","18mm"]
.forEach(t=>thickness.add(new Option(t)));
}

if(category==="HDMR"){
size.add(new Option("8x4"));
}else{
["8x4","7x4","6x4","8x3","7x3","6x3","8x2.5","7x2.5","6x2.5"]
.forEach(s=>size.add(new Option(s)));
}
}

// SAVE STOCK
function saveStock(){
let category=document.getElementById("category").value;
let brand=document.getElementById("brand").value;
let thickness=document.getElementById("thickness").value;
let size=document.getElementById("size").value;
let qty=parseInt(document.getElementById("qty").value);

if(!qty || qty<=0){
alert("Enter valid quantity");
return;
}

stocks.push({category,brand,thickness,size,qty});
localStorage.setItem("stocks", JSON.stringify(stocks));
renderStock();
checkShortage();
document.getElementById("qty").value="";
}

// STOCK TABLE
function renderStock(){
let table=document.getElementById("stockTable");

if(!stocks.length){
table.innerHTML="<tr><td colspan='6'>No stock</td></tr>";
return;
}

table.innerHTML=`
<tr>
<th>Category</th>
<th>Brand</th>
<th>Thickness</th>
<th>Size</th>
<th>Qty</th>
<th>Action</th>
</tr>`;

stocks.forEach((s,i)=>{
table.innerHTML+=`
<tr>
<td>${s.category}</td>
<td>${s.brand}</td>
<td>${s.thickness}</td>
<td>${s.size}</td>
<td>${s.qty}</td>
<td><button onclick="deleteStock(${i})">Delete</button></td>
</tr>`;
});
}

// DELETE STOCK
function deleteStock(i){
stocks.splice(i,1);
localStorage.setItem("stocks", JSON.stringify(stocks));
renderStock();
}

// LOW STOCK ALERT
function checkShortage(){
let msg="";
stocks.forEach(s=>{
if(s.qty<=5){
msg+=`${s.brand} ${s.thickness} ${s.size} LOW STOCK<br>`;
}
});
document.getElementById("alertBox").innerHTML=msg;
}

// DASHBOARD SWITCH (FIXED)
function showStock(){
document.getElementById("mainDashboard").style.display="none";
document.getElementById("stockDashboard").style.display="block";
renderStock();
}

function goBack(){
document.getElementById("stockDashboard").style.display="none";
document.getElementById("mainDashboard").style.display="block";
}

// BILL DASHBOARD
function showBilling(){
document.getElementById("mainDashboard").style.display="none";
document.getElementById("billingDashboard").style.display="block";
loadBillStock();
}

function goBackFromBill(){
document.getElementById("billingDashboard").style.display="none";
document.getElementById("mainDashboard").style.display="block";
}

// LOAD BILL STOCK
function loadBillStock(){
let select=document.getElementById("billStock");
select.innerHTML="";
stocks.forEach((s,i)=>{
select.innerHTML+=`<option value="${i}">
${s.brand} ${s.thickness} ${s.size} (Qty:${s.qty})
</option>`;
});
}

// SIZE CONVERSION
function sizeToMeter(val){
const map={"8":2.44,"7":2.14,"6":1.84,"4":1.22,"3":0.92,"2.5":0.77,"2":0.61};
return map[val];
}

// SAVE BILL HISTORY
function saveBillHistory(data){
let bills=JSON.parse(localStorage.getItem("bills"))||[];
bills.push(data);
localStorage.setItem("bills",JSON.stringify(bills));
}

// GENERATE BILL (WORKING)
function generateBill(){

let party=document.getElementById("partyName").value;
let index=document.getElementById("billStock").value;
let qty=parseFloat(document.getElementById("billQty").value);
let rate=parseFloat(document.getElementById("rate").value);
let rateType=document.getElementById("rateType").value;
let gst=document.getElementById("gstCheck").checked;
let carriage=parseFloat(document.getElementById("carriage").value)||0;
let unloading=parseFloat(document.getElementById("unloading").value)||0;
let discount=parseFloat(document.getElementById("discount").value)||0;

let item=stocks[index];

if(!item || qty>item.qty){
alert("Not enough stock");
return;
}

let dims=item.size.split("x");
let length=sizeToMeter(dims[0]);
let width=sizeToMeter(dims[1]);

let materialAmount;

if(rateType==="sqft"){
materialAmount=rate*10.764*length*width*qty;
}else{
materialAmount=rate*length*width*qty;
}

let discountAmt=materialAmount*(discount/100);
let afterDiscount=materialAmount-discountAmt;
let gstAmt=gst?afterDiscount*0.18:0;
let finalTotal=afterDiscount+gstAmt+carriage+unloading;

stocks[index].qty-=qty;
localStorage.setItem("stocks",JSON.stringify(stocks));
renderStock();

saveBillHistory({
party,
material:item.brand+" "+item.thickness+" "+item.size,
qty,
total:finalTotal,
date:new Date().toLocaleString()
});

document.getElementById("billOutput").innerHTML=`
<div style="background:#fff;padding:20px;font-family:Arial">

<h2 style="text-align:center">VPLY CENTRE</h2>
<hr>

<p><b>Party:</b> ${party}</p>
<p>${item.brand} ${item.thickness} ${item.size}</p>
<p>Qty: ${qty}</p>
<p>Rate: Rs. ${rate} (${rateType})</p>

<p>Material Amount: Rs. ${materialAmount.toFixed(2)}</p>
<p>Discount: Rs. ${discountAmt.toFixed(2)}</p>
<p>GST: Rs. ${gstAmt.toFixed(2)}</p>
<p>Carriage: Rs. ${carriage}</p>
<p>Unloading: Rs. ${unloading}</p>

<h3>Total: Rs. ${finalTotal.toFixed(2)}</h3>

<button onclick="window.print()">Print Bill</button>
<button onclick="sendWhatsAppBill()">Send WhatsApp</button>

</div>`;
}

// WHATSAPP SEND
function sendWhatsAppBill(){
let number=document.getElementById("whatsappNumber").value;
let text=document.getElementById("billOutput").innerText;
window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
}

// PREVIOUS BILLS
function showBills(){
document.getElementById("mainDashboard").style.display="none";
document.getElementById("billsDashboard").style.display="block";

let bills=JSON.parse(localStorage.getItem("bills"))||[];
let table=document.getElementById("billsTable");

table.innerHTML="<tr><th>Date</th><th>Party</th><th>Material</th><th>Qty</th><th>Total</th></tr>";

bills.forEach(b=>{
table.innerHTML+=`<tr>
<td>${b.date}</td>
<td>${b.party}</td>
<td>${b.material}</td>
<td>${b.qty}</td>
<td>Rs. ${b.total.toFixed(2)}</td>
</tr>`;
});
}

function backFromBills(){
document.getElementById("billsDashboard").style.display="none";
document.getElementById("mainDashboard").style.display="block";
}
