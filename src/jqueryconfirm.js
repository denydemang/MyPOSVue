export const showconfirmdelete = (data, func = null, menuname) => {
  $.confirm({
    buttons: {
      DELETE: function () {
        func(data.id, data.name);
      },
      CANCEL: {
        action: function () {}
      }
    },
    title: `Confirm Delete ?`,
    content: `${menuname} ${data.name} Will Be Permanently Deleted`,
    icon: 'fa fa-question-circle-o',
    theme: 'supervan',
    animation: 'scale',
    type: 'orange'
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
