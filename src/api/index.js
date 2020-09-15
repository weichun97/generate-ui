import request from "@/util/request.js";
import qs from "qs";

export const $indexApi = {
  tables: () => request.get("/generate/tables", {}),
  types: () => request.get("/generate/types", {}),
  generate: (param) => request.post("/generate/generate", qs.stringify(param))
};
