import INDEX from '../pages/index.jsx';
import UPLOAD from '../pages/upload.jsx';
import ADMIN from '../pages/admin.jsx';
import DETAIL from '../pages/detail.jsx';
import EDIT from '../pages/edit.jsx';
import LOGIN from '../pages/login.jsx';
export const routers = [{
  id: "index",
  component: INDEX
}, {
  id: "upload",
  component: UPLOAD
}, {
  id: "admin",
  component: ADMIN
}, {
  id: "detail",
  component: DETAIL
}, {
  id: "edit",
  component: EDIT
}, {
  id: "login",
  component: LOGIN
}]