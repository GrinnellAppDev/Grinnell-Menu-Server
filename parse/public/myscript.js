$(function() {
  // Hide our spinners
  $("#menuloading").hide();
  $("#nutritionloading").hide();
  $("#menusUpdating").hide();
  $("#savingTimesSpinner").hide();

  // Set up parse code things
  var parseRESTAPIKey = 'MaU8mQTxCp6IfpZZQ2jKWi9RO2LpMwQe2jy8WZlt';
  var javascriptKey = '50NEsTLzulfR7gWr8TwyMNXJZl9CupwfhrQeAftc';
  var parseAppId = 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD';
  Parse.initialize(parseAppId, javascriptKey);

  // Set up times table
  var timesQuery = new Parse.Query("Times");
  timesQuery.ascending("createdAt");
  timesQuery.find({
    success: function(times) {
      if (4 == times.length) { // There should be 4 rows in the times table
        var bFast = times[0];
        var lunch = times[1];
        var dinner = times[2];
        var outtakes = times[3];
        addRow(bFast, "Breakfast");
        addRow(lunch, "Lunch");
        addRow(dinner, "Dinner");
        addRow(outtakes, "Outtakes");
        $("#timesloading").hide();
      }
    },
    error: function(data) {
      var obj = jQuery.parseJSON(data);
      alert(obj.error);
    }
  });

  // vars to hold the files selected by the choose file buttons
  var menufile;
  var nutritionfile;

  // set the file selectors to the holders
  $('#menufileselect').bind("change", function(e) {
    var menufiles = e.target.files || e.dataTransfer.files;
    menufile = menufiles[0];
  });
  $('#nutritionfileselect').bind("change", function(e) {
    var nutritionfiles = e.target.files || e.dataTransfer.files;
    nutritionfile = nutritionfiles[0];
  });

  // Call cloud function update menus
  $('#updateButton').click(function() {
    $("#menusUpdating").show();

    // This one doesn't seem to do anything
    /*
    Parse.Cloud.httpRequest({
      url: "https://api.parse.com/1/jobs/update_menus",
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': parseAppId,
        'X-Parse-Master-Key': 'yLV2Mk9Eft2yhTHAcHvbTbxc5JRJJIyEPEpOIyCD'
      },
      success: function(httpResponse) {
        $("#menusUpdating").hide();
        alert(httpResponse.text);
      },
      error: function(httpResponse) {
        $("#menusUpdating").hide();
        alert('Request failed with response code ' + httpResponse.status);
      }
    });*/

    // This one calls the trigger correctly, but it fails with a weird error:
    //     Uncaught SyntaxError: Unexpected end of input in <unknown file>:0
    /*
    Parse.Cloud.run('update_menus_trigger', {}, {
      success: function(results) {
        $("#menusUpdating").hide();
        var fromParse = JSON.parse(results);
        var objectId = fromParse.objectId;
        alert(objectId);
      },
      error: function(data) {
        $("#menusUpdating").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });*/
    $("#menusUpdating").hide(); // REMOVE THIS EVENTUALLY (and only hide when the asynchronous task finsihes)
  });

  // Upload menu to Parse on Click
  $('#uploadMENUbutton').click(function() {
    $("#menuloading").show();
    var serverUrl = 'https://api.parse.com/1/files/' + menufile.name;

    $.ajax({
      type: "POST",
      beforeSend: function(request) {
        request.setRequestHeader("X-Parse-Application-Id", parseAppId);
        request.setRequestHeader("X-Parse-REST-API-Key", parseRESTAPIKey);
        request.setRequestHeader("Content-Type", menufile.type);
      },
      url: serverUrl,
      data: menufile,
      processData: false,
      contentType: false,
      success: function(data) {

        var query = new Parse.Query("MenuFile");
        query.find({
          success: function(menuFiles) {
            var menuFile;
            if (0 >= menuFiles.length) {
              var MenuFile = Parse.Object.extend("MenuFile");
              menuFile = new MenuFile();
            } else {
              menuFile = menuFiles[0];
            }
            menuFile.set("file", data);
            menuFile.save(null, {
              success: function(object) {
                $("#menuloading").hide();
                alert("Menu file uploaded");
              },
              error: function(data) {
                $("#menuloading").hide();
                var obj = jQuery.parseJSON(data);
                alert(obj.error);
              }
            });
          },
          error: function(data) {
            $("#menuloading").hide();
            var obj = jQuery.parseJSON(data);
            alert(obj.error);
          }
        });
      },
      error: function(data) {
        $("#menuloading").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });
  });

  // Upload nutrition to Parse on Click
  $('#uploadNUTRITIONbutton').click(function() {
    $("#nutritionloading").show();
    var serverUrl = 'https://api.parse.com/1/files/' + nutritionfile.name;

    $.ajax({
      type: "POST",
      beforeSend: function(request) {
        request.setRequestHeader("X-Parse-Application-Id", parseAppId);
        request.setRequestHeader("X-Parse-REST-API-Key", parseRESTAPIKey);
        request.setRequestHeader("Content-Type", nutritionfile.type);
      },
      url: serverUrl,
      data: nutritionfile,
      processData: false,
      contentType: false,
      success: function(data) {

        var query = new Parse.Query("NutritionFile");
        query.find({
          success: function(nutritionFiles) {
            var nutritionFile;
            if (0 >= nutritionFiles.length) {
              var NutritionFile = Parse.Object.extend("NutritionFile");
              nutritionFile = new NutritionFile();
            } else {
              nutritionFile = nutritionFiles[0];
            }
            nutritionFile.set("file", data);
            nutritionFile.save(null, {
              success: function(object) {
                $("#nutritionloading").hide();
                alert("Nutrition file uploaded");
              },
              error: function(data) {
                $("#nutritionloading").hide();
                var obj = jQuery.parseJSON(data);
                alert(obj.error);
              }
            });
          },
          error: function(data) {
            $("#nutritionloading").hide();
            var obj = jQuery.parseJSON(data);
            alert(obj.error);
          }
        });
      },
      error: function(data) {
        $("#nutritionloading").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });
  });

  // Update times table in parse
  $('#saveTimesButton').click(function() {
    $("#savingTimesSpinner").show();
    timesQuery.find({
      success: function(times) {
        if (4 == times.length) { // There should be 4 rows in the times table
          times[0] = storeRow(times[0], 1);
          // times[1] = storeRow(times[1], 2);
          // times[2] = storeRow(times[2], 3);
          // times[3] = storeRow(times[3], 4);

          Parse.Object.saveAll(times, {
            success: function(times) {
              $("#savingTimesSpinner").hide();
              alert("Meal times updated");
            },
            error: function(data) {
              $("#savingTimesSpinner").hide();
              var obj = jQuery.parseJSON(data);
              alert(obj.error);
            }
          });
        }
      },
      error: function(data) {
        $("#savingTimesSpinner").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });
  });
});

function addRow(meal, mealName) {
  var table = document.getElementById("timesTable");
  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);

  //   row.insertCell(-1).innerHTML = mealName;
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Monday") + '" onchange="updateCell()" />';
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Tuesday") + '" onchange="updateCell()" />';
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Wednesday") + '" onchange="updateCell()" />';
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Thursday") + '" onchange="updateCell()" />';
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Friday") + '" onchange="updateCell()" />';
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Saturday") + '" onchange="updateCell()" />';
  //   row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Sunday") + '" onchange="updateCell()" />';
  row.insertCell(-1).innerHTML = mealName;
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Monday") + '" />';
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Tuesday") + '" />';
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Wednesday") + '" />';
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Thursday") + '" />';
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Friday") + '" />';
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Saturday") + '" />';
  row.insertCell(-1).innerHTML = '<input type="text" value="' + meal.get("Sunday") + '" />';
}

function storeRow(meal, rowNum) {
  var cells = document.getElementById("timesTable").rows[rowNum].cells;
  for (var i = 1; i < 8; i++) {
    var cellVal = cells[i].innerHTML;
    cellVal = cellVal.replace('<input type="text" value="', '');
    cellVal = cellVal.replace('" />', '');
    cellVal = cellVal.replace('">', '');

    alert("cellVal: " + cellVal);

    var dayOfWeek;
    switch (i) {
      case 1:
        dayOfWeek = "Monday";
        break;
      case 2:
        dayOfWeek = "Tuesday";
        break;
      case 3:
        dayOfWeek = "Wednesday";
        break;
      case 4:
        dayOfWeek = "Thursday";
        break;
      case 5:
        dayOfWeek = "Friday";
        break;
      case 6:
        dayOfWeek = "Saturday";
        break;
      default:
        dayOfWeek = "Sunday";
        break;
    }
    meal.set(dayOfWeek, cellVal);
    //alert(meal.get(dayOfWeek));
  }
  return meal;
}

/*
    $("#menusUpdating").show();

    var https = require('https');
    var net = require('net');

    var headers = {
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': parseAppId,
      'X-Parse-REST-API-Key': parseRESTAPIKey
    };

    var post_options = {
      host: 'api.parse.com',
      port: '443',
      path: '/1/functions/update_menus',
      method: 'POST',
      headers: headers
    };

    var post_req = https.request(post_options, function(res) {
      console.log("Parse post statusCode: ", res.statusCode);
      res.on('data', function(d) {
        process.stdout.write(d);
      });
    });

    post_req.write("{}");
    post_req.end();
    post_req.on('error', function(e) {
      console.error(e);
    });
    $("#menusUpdating").hide();
    */


/*
    var methodUrl = "https://api.parse.com/1/functions/update_menus";

    $.ajax({
      type: "POST",
      beforeSend: function(request) {
        request.setRequestHeader("X-Parse-Application-Id", parseAppId);
        request.setRequestHeader("X-Parse-REST-API-Key", parseRESTAPIKey);
        request.setRequestHeader("Content-Type", "application/json");
      },
      url: methodUrl,
      processData: false,
      contentType: false,
      success: function(data) {
        $("#menusUpdating").hide();
        alert("Menu Updated");
      },
      error: function(data) {
        $("#menusUpdating").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });*/