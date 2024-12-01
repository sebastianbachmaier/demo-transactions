import { marked } from "marked";

/* setup some logging */
export const loggingMiddleWare = async (req, res, next) => {
  /** setup some logging */
  res.logging = "";
  res.log = (s: string | string[]) => {
    if (Array.isArray(s)) {
      s = `| ${s.join(" | ")}`;
    }
    res.logging += `${s}\n`;
  };
  res.html = (opts) => {
    res.render("index", {
      content: marked.parse(res.logging),
      ...opts
    });
  };
  next();
};
