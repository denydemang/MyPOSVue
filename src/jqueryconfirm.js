export const showconfirmdelete = (id, name, funcdelete = null, menuname) => {
  $.confirm({
    buttons: {
      DELETE: function () {
        funcdelete(id, name);
      },
      CANCEL: {
        action: function () {}
      }
    },
    title: `Confirm Delete ?`,
    content: `${menuname} ${name} Will Be Permanently Deleted`,
    icon: 'fa fa-question-circle-o',
    theme: 'supervan',
    animation: 'scale',
    type: 'orange'
  });
};
export const showconfirmbulkdelete = (listData = [], funcbulkdelete = null, menuname) => {
  $.confirm({
    buttons: {
      DELETE: function () {
        funcbulkdelete(listData);
      },
      CANCEL: {
        action: function () {}
      }
    },
    title: `Confirm Delete ?`,
    content: `All Selected ${menuname} Will Be Permanently Deleted`,
    icon: 'fa fa-question-circle-o',
    theme: 'supervan',
    animation: 'scale',
    type: 'orange'
  });
};
export const showconfirmapprove = (id, name, funcapprove = null, menuname) => {
  $.confirm({
    buttons: {
      APPROVE: function () {
        funcapprove(id, name);
      },
      CANCEL: {
        action: function () {}
      }
    },
    title: `Confirm Approve ?`,
    content: `${menuname} : ${name} Will Be Approved & Cannot Be Undone`,
    icon: 'fa fa-question-circle-o',
    theme: 'supervan',
    animation: 'scale',
    type: 'blue'
  });
};
export const showconfirmbulkapprove = (listData = [], funcapprove = null, menuname) => {
  $.confirm({
    buttons: {
      APPROVE: function () {
        funcapprove(listData);
      },
      CANCEL: {
        action: function () {}
      }
    },
    title: `Confirm Approve ?`,
    content: `Selected ${menuname} Will Be Approved & Cannot Be Undone`,
    icon: 'fa fa-question-circle-o',
    theme: 'supervan',
    animation: 'scale',
    type: 'blue'
  });
};
export const showerror = (message) => {
  $.alert({
    title: 'Error',
    icon: 'fas fa-warning',
    type: 'red',
    content: message
  });
};
