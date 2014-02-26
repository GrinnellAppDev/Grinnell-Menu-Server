$(function() {
  $("#menuloading").hide();
  $("#nutritionloading").hide();
  $("#menusUploading").hide();
  $("#savingTimesSpinner").hide();

  var javascriptKey = '50NEsTLzulfR7gWr8TwyMNXJZl9CupwfhrQeAftc';
  var parseAppId = 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD';
  Parse.initialize(parseAppId, javascriptKey);


  var timesQuery = new Parse.Query("Times");
  timesQuery.find({
    success: function(times) {
      if (4 == times.length) { // There should be 4 rows in the times table
        var bFast = times[0];
        var lunch = times[1];
        var dinner = times[2];
        var outtakes = times[3];

      }
    },
    error: function(data) {
      var obj = jQuery.parseJSON(data);
      alert(obj.error);
    }
  });



  $("#b-mon").val('12345');

  var menufile;
  var nutritionfile;
  var parseRESTAPIKey = 'MaU8mQTxCp6IfpZZQ2jKWi9RO2LpMwQe2jy8WZlt';

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
    $("#menusUploading").show();


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
        $("#menusUploading").hide();
        alert(httpResponse.text);
      },
      error: function(httpResponse) {
        $("#menusUploading").hide();
        alert('Request failed with response code ' + httpResponse.status);
      }
    });*/

    // This one calls the trigger correctly, but it fails with a weird error:
    //     Uncaught SyntaxError: Unexpected end of input in <unknown file>:0
    /*
    Parse.Cloud.run('update_menus_trigger', {}, {
      success: function(results) {
        $("#menusUploading").hide();
        var fromParse = JSON.parse(results);
        var objectId = fromParse.objectId;
        alert(objectId);
      },
      error: function(data) {
        $("#menusUploading").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });*/
    $("#menusUploading").hide(); // REMOVE THIS EVENTUALLY (and only hide when the asynchronous task finsihes)
  });

  // Update times table in parse
  $('#saveTimesButton').click(function() {
    $("#savingTimesSpinner").show();

    $("#savingTimesSpinner").hide(); // REMOVE THIS EVENTUALLY (and only hide when the asynchronous task finsihes)
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
});

/*
    $("menusUploading").show();

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
    $("menusUploading").hide();
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
        $("#menusUploading").hide();
        alert("Menu Updated");
      },
      error: function(data) {
        $("#menusUploading").hide();
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });*/



/*
function addRow() {
          
    var myName = document.getElementById("name");
    var age = document.getElementById("age");
    var table = document.getElementById("myTableData");
 
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
 
    row.insertCell(0).innerHTML= "Meal";
    row.insertCell(1).innerHTML= myName.value;
    row.insertCell(2).innerHTML= age.value;
 
}
 
function addTable() {
      
    var myTableDiv = document.getElementById("myDynamicTable");
      
    var table = document.createElement('TABLE');
    
    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);
      
    for (var i=0; i<3; i++){
       var tr = document.createElement('TR');
       tableBody.appendChild(tr);
       
       for (var j=0; j<4; j++){
           var td = document.createElement('TD');
           td.width='75';
           td.appendChild(document.createTextNode("Cell " + i + "," + j));
           tr.appendChild(td);
       }
    }
    myTableDiv.appendChild(table);
    
}*/