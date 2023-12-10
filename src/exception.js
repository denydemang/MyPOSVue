import { showerror } from './jqueryconfirm';

class ex {
  funcnetworkerror = null;
  func400 = null;
  func401 = null;
  func402 = null;
  func403 = null;
  func404 = null;
  func405 = null;
  func500 = null;
  additionaldata = null;
  constructor(errorresponse) {
    this.error = errorresponse;
  }

  showError() {
    if (this.error.code == 'ERR_NETWORK') {
      if (this.funcnetworkerror == null) {
        showerror('Cannot Reach Connection To The Server');
      } else {
        this.funcnetworkerror(this.error, this.additionaldata);
      }
    }
    if (this.error.code == 'ERR_BAD_REQUEST') {
      const status = this.error.response.status;
      if (status == 400) {
        if (this.func400 == null) {
          showerror('Invalid Request From Client (Status 400 Bad Request)');
        } else {
          this.func400(this.error, this.additionaldata);
        }
      }
      if (status == 401) {
        if (this.func401 == null) {
          showerror('You Are Unauthorized or Session Has been Expired (Status 401)');
        } else {
          this.func401(this.error, this.additionaldata);
        }
      }
      if (status == 402) {
        if (this.func402 == null) {
          showerror('Has Problem With The Payment (status 402)');
        } else {
          this.func402(this.error, this.additionaldata);
        }
      }
      if (status == 403) {
        if (this.func403 == null) {
          showerror('You Dont Have Permission ! (status 403)');
        } else {
          this.func403(this.error, this.additionaldata);
        }
      }
      if (status == 404) {
        if (this.func404 == null) {
          showerror('The Resource Is Not Found ! (status 404)');
        } else {
          this.func404(this.error, this.additionaldata);
        }
      }
      if (status == 405) {
        if (this.func405 == null) {
          showerror('The Method Is Not Allowed ! (status 405)');
        } else {
          this.func405(this.error, this.additionaldata);
        }
      }
    }
    if (this.error.code == 'ERR_BAD_RESPONSE') {
      const data = this.error.response.data;
      if (this.func500 == null) {
        if (data.hasOwnProperty('message')) {
          if (data.message.include('No connection could be made because the target machine actively refused it')) {
            showerror('Cannot Connect To Database');
          } else {
            showerror('Server Temporary Unavailable');
          }
        } else {
          showerror('Server Temporary Unavailable');
        }
      } else {
        this.func500(this.error, this.additionaldata);
      }
    }
  }
}
export default ex;
