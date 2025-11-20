import INDEX from '../pages/index.jsx';
import UPLOAD from '../pages/upload.jsx';
import ADMIN from '../pages/admin.jsx';
import DETAIL from '../pages/detail.jsx';
import EDIT from '../pages/edit.jsx';
import .DATASOURCES/FIX_TIME_FORMATUPLOAD from '../pages/.datasources/fix_time_formatupload.jsx';
import .DATASOURCES/FIX_TIME_FORMATEDIT from '../pages/.datasources/fix_time_formatedit.jsx';
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
  id: ".datasources/fix_time_formatupload",
  component: .DATASOURCES/FIX_TIME_FORMATUPLOAD
}, {
  id: ".datasources/fix_time_formatedit",
  component: .DATASOURCES/FIX_TIME_FORMATEDIT
}]