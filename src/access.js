import myenc from '@/myencription.js'

const checkview = (menuname) => {
    try {
    const accessview = JSON.parse(localStorage.getItem('accessview'))
    if(accessview || accessview.length != 0 || accessview != null){
      accessview.map(item => {
        item.id_module = parseInt(myenc.decrypt(item.id_module));
        item.sub_menu = myenc.decrypt(item.sub_menu);
        item.xView = parseInt(myenc.decrypt(item.xView));
        return item
        })

        const filter = accessview.filter(item => {
            return item.sub_menu == menuname
          })
        if (!filter){
            return false;
        }
        if (filter[0].xView){
            return true
          } else {
            return false
          }
    } else{
      return false;
    }


    } catch (error) {
    return false;
    } 
};

export default checkview;