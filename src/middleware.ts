import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PARENT_PATHS = ["/dashboard", "/approvals", "/settings", "/avatars", "/setup"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // セッションを更新する（トークンrefresh）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 親ルートは未ログインなら/parent-loginへ。
  // TODO(auth): profiles.role==='parent'の厳密チェックは子のパスキー認証実装時に追加する。
  const isParentPath = PARENT_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
  if (isParentPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/parent-login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
