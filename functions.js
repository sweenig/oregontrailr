google.charts.load("current", {packages:["corechart"]});
function nFormatter(n){
  var exp = n.toExponential(1);
  f1 = exp.substring(0,3);
  f2 = exp.substring(exp.length - 1);
  if (f2 == 4 ){
    f = "$" + f1*10 + 'k';
  } else if (f2 == 3){
    f = "$" + f1 + 'k';
  } else {
    f = "$" + (Math.round(n/100)*100).toString();
  }
  return f;
}
function drawChart() {
  var rawdata = [];
  rawdata.push(["Category","Subtotal"]);
  grandtotal = 0;
  for (category in globCategoryTotals){
    rawdata.push([category,globCategoryTotals[category]]);
    grandtotal += globCategoryTotals[category];
  }
  barindices = [0,1,2,3,4,5,6,7,8,9,10];
  barticks = [];
  for (var i=0; i < barindices.length; i++){
    var j = {};
    j["v"] = barindices[i] * grandtotal / 10;
    j["f"] = nFormatter(j["v"]);
    barticks.push(j);
  }

  var piedata = google.visualization.arrayToDataTable(rawdata);
  var pieoptions = {
    backgroundColor: 'black',
    pieSliceBorderColor: 'black',
    // pieSliceText: 'label',
    chartArea: {
      left: 10,
      top: 10,
      width: 380,
      height: 180,
    },
    legend: {textStyle: {
        color: '#FFF',
        fontSize: 20,
        bold: true,
    },},
    pieSliceTextStyle: {
      color: 'white',
      fontSize: 20,
      bold: true,
    },
    tooltip: {textStyle: {
        fontSize: 20,
        bold: true,
    },},
  };
  var piechart = new google.visualization.PieChart(document.getElementById('piechart'));
  piechart.draw(piedata, pieoptions);

  var barrawdata = [];
  barrawdata[0] = ["MyBuild"].concat(Object.keys(globCategoryTotals));
  barrawdata[1] = [globTrailerName].concat(Object.values(globCategoryTotals));
  var bardata = google.visualization.arrayToDataTable(barrawdata);
  var baroptions = {
    isStacked: true,
    hAxis: {
      format: 'currency',
      ticks: barticks,
    },
    bar: {groupWidth: '100%',},
    theme: 'maximized',
  };
  var barchart = new google.visualization.BarChart(document.getElementById('barchart'));
  barchart.draw(bardata, baroptions);
}
Number.prototype.formatMoney = function(c, d, t){
    var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

globCategoryTotals = {};
globTrailerName = "";

function update(){
  var inputs = document.getElementById('buildtable').getElementsByTagName('input');
  var sum = 0,builturl = '';
  builturl = '?'; //start building the save url
  basepriceval = document.getElementById('baseprice').value; //get the id of the trailer selected
  builturl += 'basemodel=' + basepriceval; //add the trailer to the url as a parameter
  category_subtotals = {};
  for(var i=0; i<inputs.length; i++) { //loop through the options
    var ip = inputs[i]; //current input
    current_category = ip.getAttribute("category");
    if (!(current_category in category_subtotals)){category_subtotals[current_category] = 0;} //start summing the category
    if (ip.getAttribute("class") == "w3-check" && ip.checked) { //if it's a checkbox and it's checked
      sum += Number(ip.getAttribute("price")); //add the option's price to the sum
      builturl += "&" + ip.getAttribute("id"); //add the option to the url
      category_subtotals[current_category] += Number(ip.getAttribute("price"));
    }
  }
  for(var category in category_subtotals){
    document.getElementById("catsub" + category).innerHTML = category + " Subtotal: $" + category_subtotals[category];
  }
  savebuttons = document.getElementsByClassName("savebutton"); //get the dynamic tag in each save button
  sharebutton = document.getElementById("sharebutton");
  if (basepriceval != '') { //if a base model has been selected (manually or via url)
    globTrailerName = trailers[basepriceval].name;
    email_link_suffix = 
    "?subject=" + encodeURIComponent("Question about my ") + trailers[basepriceval].name + " build" //subject line
    + "&body="
    + encodeURIComponent("Here is the link to the options I've selected: ") //introductory text
    + encodeURIComponent(location.pathname + builturl) //include the url
    + "%0D%0A%0D%0A" //two carriage returns
    + encodeURIComponent("Could you help me?"); //setup the email body
    document.getElementById("mailjon").href += email_link_suffix; //append the email body to the email links
    document.getElementById("mailsaw").href += email_link_suffix; //append the email body to the email links
    sum += Number(trailers[basepriceval].price); //add the price of the trailer to the running total
    document.getElementById("baserow").classList.remove("w3-hide");
    document.getElementById("baseecho").innerHTML = "$" + trailers[basepriceval].price; //put the trailer price on the trailer line
    document.getElementById("basedesc").innerHTML = trailers[basepriceval].description; //put the trailer description on the trailer line
    document.getElementById("feature").src = trailers[basepriceval].img; //change the image to the currently selected trailer
    globCategoryTotals = {"Base": trailers[basepriceval].price};
    for(var i=0; i<savebuttons.length;i++){ //loop through the save buttons' dynamic tags
      savebuttons[i].innerHTML = "<i class='fa fa-sign-out w3-margin-right'></i> Get a quote for your " + trailers[basepriceval].name
      if(sum > 0){savebuttons[i].innerHTML += " (est. $" + sum.formatMoney(0) + ")";}
      savebuttons[i].href = "https://docs.google.com/forms/d/e/1FAIpQLSebnw7jfCzKQzIo8ZuF5-NmY_FMf01sFzl5oOdUFzS2dGucTw/viewform?entry.648048562=" + encodeURIComponent(builturl);
    }
    sharebutton.innerHTML = "<i class='fa fa-share-square-o w3-margin-right'></i> Share your " + trailers[basepriceval].name;
  } else {
    for(var i=0; i<savebuttons.length;i++) {
      savebuttons[i].innerHTML = "<i class='fa fa-sign-out w3-margin-right'></i> Get a quote";
      if(sum > 0){savebuttons[i].innerHTML += " (est. $" + sum.formatMoney(0) + ")";}
      savebuttons[i].href = "https://docs.google.com/forms/d/e/1FAIpQLSebnw7jfCzKQzIo8ZuF5-NmY_FMf01sFzl5oOdUFzS2dGucTw/viewform?entry.648048562=" + encodeURIComponent(builturl);
    }
  }
  // console.log("Build url: " + location.pathname + builturl);
  document.getElementById('sharemodalurl').href = location.pathname + builturl;
  document.getElementById('sharemodalurl').innerHTML = location.pathname + builturl;
  sharebutton.href = location.pathname + builturl;
  if (sum > 0){
    document.getElementById("showbreakdownbutton").disabled = false;
    sharebutton.disabled = false;
  } else {
    document.getElementById("showbreakdownbutton").disabled = true;
    sharebutton.disabled = true;
  }
  var table = document.getElementById("buildtable");
  if (document.getElementById('totalrow') == null){ //if the total row doesn't exist, create it
    var txt1 = document.createTextNode("Total:");
    var td1 = document.createElement("td");
    td1.appendChild(txt1);
    var txt2 = document.createTextNode("");
    var td2 = document.createElement("td");
    td2.id = "total";
    td2.colSpan = "2";
    td2.appendChild(txt2);
    var tr = document.createElement("tr");
    tr.id = "totalrow";
    tr.appendChild(td1);
    tr.appendChild(td2)
    table.appendChild(tr);
  }
  document.getElementById("total").innerHTML = "$" + sum.formatMoney(0); //add the total to the bottom line
  globCategoryTotals = Object.assign({}, globCategoryTotals, category_subtotals);
  drawChart();
}
function getURLParams(){
  var parenturl=parent.document.location.search; //get the parent page URL parameters
  if (parenturl.length > 0) {
    parenturl=parenturl.replace('?',''); //remove the leading ? from the URL parameters
    var argsarray=parenturl.split('&'); //split the parameters into an array of parameter pairs
    var argsmatrix = new Array(argsarray.length); //create the matrix to hold the parameters after splitting
    for (var i = 0; i < argsarray.length; i++){ //split the array members and put into the matrix
      argsmatrix[i] = new Array(2); //create a new sub-array
      argsmatrix[i] = argsarray[i].split('='); //split each row of the array into two components, store into new array as sub-array
    }
    return argsmatrix;
  } else {return new Array(0);}
}
function initialize(){
  for (var j = 0; j < Object.keys(trailers).length; j++) {
    key = Object.keys(trailers)[j];
    document.getElementById("baseprice").innerHTML += "<option value='" + key + "'>" + trailers[key].name + " - $" + trailers[key].price + "</option>";
  }
  var table = document.getElementById("buildtable");
  for (var j = 0; j < Object.keys(options).length; j++) {
    key = Object.keys(options)[j];
    if (options[key].label == "Category"){
      var current_category = options[key].title;
      var category_header = document.createElement("h3");
      category_header.innerHTML = options[key].title;
      category_header.id = "catsub" + options[key].title;
      var td1 = document.createElement("td");
      td1.appendChild(category_header);
      td1.setAttribute("colspan","3");
      var tr = document.createElement("tr");
      tr.appendChild(td1);
      table.appendChild(tr);
    } else {
      var description_div = document.createElement("div");//create description div
      description_div.innerHTML = options[key].description; //populate description div
      description_div.classList.add("w3-cell-row", "w3-hide"); //add styling to description div
      var icon = document.createElement("i"); //create icon to contain description div
      icon.classList.add("fa", "fa-info-circle", "w3-text-gray", "w3-text-left");
      icon.onclick = function(){this.children[0].classList.toggle('w3-hide');};
      icon.appendChild(description_div); //add description div to icon
      var title = document.createElement("span"); //create the label span
      title.innerHTML = options[key].label;
      var label = document.createElement("label");
      label.appendChild(title); //put the label span into the label
      label.appendChild(icon); //put the icon into the label
      var cell1 = document.createElement("td");
      cell1.appendChild(label);
      var tr = document.createElement("tr");
      tr.appendChild(cell1);
      var checkbox = document.createElement("input");
      checkbox.id=key;
      checkbox.setAttribute("category",current_category);
      checkbox.onchange=function(){update();};
      checkbox.classList.add("w3-check");
      checkbox.type = "checkbox";
      checkbox.setAttribute("price",options[key].price);
      var cell2 = document.createElement("td");
      cell2.style.textAlign = "center";
      cell2.appendChild(checkbox);
      tr.appendChild(cell2);
      var cell3 = document.createElement("td");
      cell3.style.textAlign = "right";
      cell3.innerHTML = "$" + options[key].price;
      tr.appendChild(cell3);
      table.appendChild(tr);
    }
  }
  var argsmatrix = getURLParams();
  for (var j = 0; j < argsmatrix.length; j++){
    if (argsmatrix[j][0] == 'basemodel'){document.getElementById('baseprice').value = argsmatrix[j][1];}
    else {document.getElementById(argsmatrix[j][0]).checked = true;}
  }
  update();
}
function togglepie(elem){
  document.getElementById('piechart').classList.toggle('w3-hide');
  drawChart();
  if(elem.innerHTML.search("Show") > 0) {
    elem.innerHTML = elem.innerHTML.replace("Show","Hide");
  } else {
    elem.innerHTML = elem.innerHTML.replace("Hide","Show");
  }
}