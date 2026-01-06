$(document).ready(function () {
    GetAccounts();
});


function GetAccounts() {

    webapi.safeAjax({
        type: "GET",
        //url: "/_api/data/v9.2/accounts?$select=name,accountnumber,address1_primarycontactname,emailaddress1",

        url: "/_api/accounts?$select=name,accountnumber,address1_primarycontactname,emailaddress1",
        contentType: "application/json",
        headers: {
            "Prefer": "odata.include-annotations=*"
        },
        success: function (data) {

            let tableBody = document.getElementById("accountTableBody");
            tableBody.innerHTML = "";

            data.value.forEach(acc => {
                let row = `
            <tr>
                <td>${acc.name || ""}</td>
                <td>${acc.address1_primarycontactname || ""}</td>
                <td>${acc.emailaddress1 || ""}</td>
                <td>${acc.accountnumber || ""}</td>
                <td>
                    <button type="button" 
                   class="btn btn-primary edit-btn" 
                    data-id="${acc.accountid}" 
                    data-bs-toggle="modal" 
                    data-bs-target="#staticBackdrop">
                    Edit
                    </button>


                    <button 
                    type="button" 
                    class="btn btn-danger btnDelete" 
                    data-account-id="${acc.accountid}"
                    style="margin:0px;">
                    Delete
                    </button>

                </td>
                <td style="display: none;">${acc.accountid}<td>
            </tr>
        `;
                tableBody.innerHTML += row;
            });
        },

        error: function (xhr, textStatus, errorThrown) {
            console.log(xhr);
        }
    });

};
document.getElementById("accountTableBody").addEventListener("click", function (e) {
    debugger;

    // ---------------------------
    // Handle EDIT button
    // ---------------------------
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        let accountId = editBtn.getAttribute("data-id");

        if (!accountId) {
            alert("Account ID is missing!");
            return;
        }

        document.getElementById("hdnAccountId").value = accountId;

        loadAccount(accountId); // API call
        return; // stop further processing
    }

    // ---------------------------
    // Handle DELETE button
    // ---------------------------
    const deleteBtn = e.target.closest(".btnDelete");
    if (deleteBtn) {
        let accountId = deleteBtn.getAttribute("data-account-id");

        if (!accountId) {
            alert("Account ID is missing!");
            return;
        }

        deleteAccount(accountId);
        return;
    }
});


// document.getElementById("accountTableBody").addEventListener("click", function (e) {
//     debugger;

//     if (e.target.classList.contains("edit-btn")) {
//         // Get the GUID from the clicked button
//         let accountId = e.target.getAttribute("data-id");

//         // Store it in the modal's hidden field
//         document.getElementById("hdnAccountId").value = accountId;

//         loadAccount(accountId); // call API
//     }
// });



function loadAccount(accountId) {
    
    webapi.safeAjax({
        type: "GET",
        url: "/_api/accounts(" + accountId + ")?$select=name,emailaddress1,address1_primarycontactname,accountnumber",
        contentType: "application/json",

        success: function (data) {
            console.log("Loaded:", data);

            // Fill Modal Form
            document.getElementById("txtName").value = data.name || "";
            document.getElementById("txtEmail").value = data.emailaddress1 || "";
            document.getElementById("txtContact").value = data.address1_primarycontactname || "";
            document.getElementById("txtAddress").value = data.accountnumber || "";
        },

        error: function (xhr) {
            console.log(xhr);
            alert("Error loading account");
        }
    });
}



document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("save").addEventListener("click", function () {
        debugger;

        // Read the GUID from the hidden input field in the modal
        var accountId = document.getElementById("hdnAccountId").value;

        if (accountId) {
            updateAccount(accountId); // Edit mode
        } else {
            createAccount(); // Add mode
        }
    });
});



function createAccount() {

    var record = {};

    // Collect values from input fields
    record.name = document.getElementById("txtName").value || "";
    record.address1_primarycontactname = document.getElementById("txtContact").value || "";
    record.emailaddress1 = document.getElementById("txtEmail").value || "";
    record.accountnumber = document.getElementById("txtAddress").value || "";

    // Call the API to save the record
    webapi.safeAjax({
        type: "POST",
        contentType: "application/json",
        url: "/_api/accounts",  // or use your correct API URL

        data: JSON.stringify(record),

        success: function (data, textStatus, xhr) {
            var newId = xhr.getResponseHeader("entityid");
            console.log("New account created:", newId);

            // Show success message
            alert("Account created successfully!");

            // Reload the page after alert
            location.reload();  // This will refresh the page
        },

        error: function (xhr) {
            console.log(xhr);
            alert("Error creating account.");
        }
    });
};

let currentAccountId = null;


function updateAccount(accountId) {
    var record = {
        name: document.getElementById("txtName").value,
        address1_primarycontactname: document.getElementById("txtContact").value,
        emailaddress1: document.getElementById("txtEmail").value,
        accountnumber: document.getElementById("txtAddress").value
    };

    webapi.safeAjax({
        type: "PATCH",
        url: "/_api/accounts(" + accountId + ")",
        contentType: "application/json",
        data: JSON.stringify(record),

        success: function () {
            alert("Record updated!");

            let modal = bootstrap.Modal.getInstance(document.getElementById("staticBackdrop"));
            modal.hide();

            GetAccounts();
        },

        error: function (xhr) {
            console.log(xhr);
            alert("Error updating record");
        }
    });
};



function deleteAccount(accountId) {
    debugger;

    if (confirm("Do you want to delete this record?")) {

        webapi.safeAjax({
            type: "DELETE",
            url: "/_api/accounts(" + accountId + ")",   // your original URL
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                alert("Record deleted successfully!");
                console.log("Record deleted");
                
                // Reload the page
                location.reload();
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(xhr);
            }
        });

    }
}



//  function deleteAccount(accountId) {
//     debugger;

//     if (confirm("Do you want to delete this record?")) {

//         webapi.safeAjax({
//             type: "DELETE",
//             url: "/_api/accounts(" + accountId + ")",   // your original URL
//             contentType: "application/json",
//             success: function (data, textStatus, xhr) {
//                 alert("Record deleted successfully!");
//                 console.log("Record deleted");
//             },
//             error: function (xhr, textStatus, errorThrown) {
//                 console.log(xhr);
//             }
//         });

//     }
// }
