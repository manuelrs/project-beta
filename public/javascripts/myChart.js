var ctx = document.getElementById("myChart1").getContext("2d");
var ctx2 = document.getElementById("myChart2").getContext("2d");
Chart.defaults.global.hover.mode = "nearest";

var data = heartRates;
var data2 = oxigenation;

var myChart1 = new Chart(ctx, {
  type: "line",
  data: data
});

var myChart2 = new Chart(ctx2, {
  type: "line",
  data: data2
});
