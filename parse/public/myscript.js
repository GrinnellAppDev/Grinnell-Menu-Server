$(function() {
  // Hide our spinners
  $("#menuloading").hide();
  $("#menusUpdating").hide();
  $("#savingTimesSpinner").hide();

  // Set up parse code things
  var parseRESTAPIKey = 'MaU8mQTxCp6IfpZZQ2jKWi9RO2LpMwQe2jy8WZlt';
  var javascriptKey = '50NEsTLzulfR7gWr8TwyMNXJZl9CupwfhrQeAftc';
  var parseAppId = 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD';
  Parse.initialize(parseAppId, javascriptKey);

  // Load current URL into the input field
  var nutritionQuery = new Parse.Query("NutritionFile");
  nutritionQuery.find({
    success: function(nutritionFiles) {
      var nutritionFile;
      if (0 >= nutritionFiles.length) {
        document.getElementById("nutritionfileURL").value = null;
      } else {
        document.getElementById("nutritionfileURL").value = nutritionFiles[0].get("url");
      }
      $("#nutritionloading").hide();
    },
    error: function(data) {
      $("#nutritionloading").hide();
      var obj = jQuery.parseJSON(data);
      alert(obj.error);
    }
  });

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
      $("#timesloading").hide();
      var obj = jQuery.parseJSON(data);
      alert(obj.error);
    }
  });

  // var to hold the menu file
  var menufile;

  // set the file selectors to the holder
  $('#menufileselect').bind("change", function(e) {
    var menufiles = e.target.files || e.dataTransfer.files;
    menufile = menufiles[0];
  });

  // Call cloud function update menus
  $('#updateButton').click(function() {
    $("#menusUpdating").show();

    Parse.Cloud.run('update_menus_trigger', {}, {
      success: function(results) {
        $("#menusUpdating").hide();
        var fromParse = JSON.parse(results);
        var objectId = fromParse.objectId;
        if (undefined == objectId) {
          alert("Menus are currently updating!")
        } else {
          alert(objectId);
        }
      },
      error: function(data) {
        $("#menusUpdating").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });
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

  // Update nutrition in Parse on Click
  $('#uploadNUTRITIONbutton').click(function() {
    $("#nutritionloading").show();
    nutritionQuery.find({
      success: function(nutritionFiles) {
        var nutritionFile;
        if (0 >= nutritionFiles.length) {
          var NutritionFile = Parse.Object.extend("NutritionFile");
          nutritionFile = new NutritionFile();
        } else {
          nutritionFile = nutritionFiles[0];
        }
        var url = document.getElementById("nutritionfileURL").value;
        nutritionFile.set("url", url);
        nutritionFile.save(null, {
          success: function(object) {
            Parse.Cloud.run('create_nutrition_database_trigger', {}, {
              success: function(results) {
                $("#nutritionloading").hide();
                var fromParse = JSON.parse(results);
                var objectId = fromParse.objectId;
                if (undefined == objectId) {
                  alert("Nutrition file saved, database updating. Please wait __ minutes before updating menus");
                } else {
                  alert(objectId);
                }
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
          times[1] = storeRow(times[1], 2);
          times[2] = storeRow(times[2], 3);
          times[3] = storeRow(times[3], 4);

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

  var cell = row.insertCell(-1);
  cell.innerHTML = mealName;
  cell.id = "mealName";

  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Monday");
  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Tuesday");
  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Wednesday");
  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Thursday");
  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Friday");
  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Saturday");
  cell = row.insertCell(-1);
  cell.contentEditable = true;
  cell.innerHTML = meal.get("Sunday");
}

function storeRow(meal, rowNum) {
  var cells = document.getElementById("timesTable").rows[rowNum].cells;
  for (var i = 1; i < 8; i++) {
    var cellVal = cells[i].innerHTML;
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
  }
  return meal;
}