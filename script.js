// LOAD STOCK SAFELY
let stocks = JSON.parse(localStorage.getItem("stocks")) || [];

// INITIAL LOAD
window.onload = function(){
updateFields();
renderStock();
checkShortage();
};

// CATEGORY FIELD UPDATE
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

// ADD STOCK
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

// SAVE PERMANENTLY
localStorage.setItem("stocks", JSON.stringify(stocks));

renderStock();
checkShortage();

document.getElementById("qty").value="";
}

// SHOW STOCK TABLE
function renderStock(){

let table=document.getElementById("stockTable");

if(!stocks.length){
table.innerHTML="<tr><td colspan='6'>No stock available</td></tr>";
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
checkShortage();
}

// LOW STOCK ALERT
function checkShortage(){

let alertMsg="";

stocks.forEach(s=>{
if(s.qty<=5){
alertMsg+=`${s.brand} ${s.thickness} ${s.size} LOW STOCK<br>`;
}
});

document.getElementById("alertBox").innerHTML=alertMsg;
}

// DASHBOARD SWITCH
function showStock(){
document.getElementById("mainDashboard").style.display="none";
document.getElementById("stockDashboard").style.display="block";
renderStock();
checkShortage();
}

function goBack(){
document.getElementById("stockDashboard").style.display="none";
document.getElementById("mainDashboard").style.display="block";
}

// SEARCH STOCK
function searchStock(){

let search=document.getElementById("searchBrand").value.toLowerCase();

if(search===""){
renderStock();
return;
}

let filtered=stocks.filter(s=>
s.brand.toLowerCase().includes(search)
);

let table=document.getElementById("stockTable");

table.innerHTML=`
<tr>
<th>Category</th>
<th>Brand</th>
<th>Thickness</th>
<th>Size</th>
<th>Qty</th>
<th>Action</th>
</tr>`;

filtered.forEach((s,i)=>{
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

// EXCEL PLACEHOLDER
function handleExcelUpload(){
alert("Excel import coming next step 👍");
}
