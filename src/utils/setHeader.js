import api from "./api";

export function setAuthToken(testmode) {
  const token = localStorage.getItem("token");

  if (token) {
    // console.log(testmode)
    api.defaults.headers.common["Token"] = token;
    api.defaults.headers.common['Test'] = testmode;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["token"];
    delete api.defaults.headers.common["test"];
    localStorage.removeItem("token");
    localStorage.removeItem('testmode');
  }
}

export function setMultipart() {
  api.defaults.headers["Content-Type"] = "multipart/form-data";
}

export function removeMultipart() {
  delete api.defaults.headers["Content-Type"];
}
