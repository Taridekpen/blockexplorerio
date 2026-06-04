import {
  ADMIN_ACCESS_PASSPHRASE,
  ADMIN_SECRET_HEADER,
} from "@/lib/adminSecret";

export function isAdminAuthorized(request: Request): boolean {
  return request.headers.get(ADMIN_SECRET_HEADER) === ADMIN_ACCESS_PASSPHRASE;
}
