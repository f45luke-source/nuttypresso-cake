(() => {
  const origin = "https://halfhouse-gangnam.fairyyak17.chatgpt.site";
  const name = location.pathname.split("/").pop() || "index.html";
  const paths = {"index.html":"/", "inquiry.html":"/inquiry", "pangyo.html":"/pangyo", "cake.html":"/"};
  if (!(name in paths)) return;
  const hash = location.hash || (name === "cake.html" ? "#cake-reservation" : "");
  location.replace(origin + paths[name] + location.search + hash);
})();
