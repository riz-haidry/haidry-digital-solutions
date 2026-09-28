import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo-640.png";

const pageMetadata = {
  "/": {
    title: "Haidry Digital Solutions | Web Design & Digital Products",
    description:
      "Haidry Digital Solutions helps businesses in India grow with custom websites, UI/UX design, brand identity, campaign graphics and practical digital products.",
  },
  "/services": {
    title: "Web Design, UI/UX & Branding Services | Haidry Digital",
    description:
      "Explore web design and development, UI/UX, graphic design, branding, campaign posters and digital technology services for growing businesses in India.",
  },
  "/portfolio": {
    title: "Creative Portfolio: Branding & Web Design | Haidry Digital",
    description:
      "Explore branding, graphic design, UI/UX, poster and website concept work from Haidry Digital Solutions, an independent digital studio in India.",
  },
  "/contact": {
    title: "Contact Haidry Digital Solutions | Start a Project",
    description:
      "Start a project with Haidry Digital Solutions. Tell us about your website, branding, UI/UX, campaign design or digital product goals.",
  },
};

const organizationDescription =
  "Independent digital studio in India creating business websites, brand identities, user experiences, campaign graphics and useful digital products.";
const services = [
  ["Website design and development", "Responsive business websites, e-commerce experiences and web applications."],
  ["UI/UX design", "Research-led user flows, interfaces, prototypes and design systems."],
  ["Branding and graphic design", "Visual identities, campaign creative, posters, banners and brand collateral."],
  ["Apps and technology", "Custom web applications, business tools, integrations and ongoing improvements."],
];
const configuredSiteUrl = (import.meta.env.VITE_SITE_URL || "").trim();
const socialImagePath = "/og-image.png";

function normalizedPath(pathname) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

function getSiteOrigin() {
  if (configuredSiteUrl) {
    try {
      const url = new URL(configuredSiteUrl);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {
      // Fall back to the live host when the optional build-time URL is invalid.
    }
  }
  const { hostname, origin } = window.location;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  ) {
    return "";
  }
  return origin;
}

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!url) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

function createStructuredData(origin, pathname) {
  const organizationId = `${origin}/#organization`;
  const graph = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: "Haidry Digital Solutions",
      url: `${origin}/`,
      description: organizationDescription,
      logo: new URL(logo, `${origin}/`).href,
      image: `${origin}${socialImagePath}`,
      areaServed: { "@type": "Country", name: "India" },
      knowsAbout: services.map(([name]) => name),
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: "Haidry Digital Solutions",
      url: `${origin}/`,
      publisher: { "@id": organizationId },
      inLanguage: "en-IN",
    },
  ];

  if (pathname === "/services") {
    services.forEach(([name, description], index) => {
      graph.push({
        "@type": "Service",
        "@id": `${origin}/services#service-${index + 1}`,
        name,
        description,
        provider: { "@id": organizationId },
        areaServed: { "@type": "Country", name: "India" },
        url: `${origin}/services`,
      });
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export default function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalizedPath(pathname);
    const isAdmin = path === "/admin" || path.startsWith("/admin/");
    const metadata = pageMetadata[path];
    const isPublicPage = Boolean(metadata) && !isAdmin;
    const page =
      metadata ||
      (isAdmin
        ? {
            title: "Admin sign in | Haidry Digital Solutions",
            description: "Private administration area.",
          }
        : {
            title: "Page not found | Haidry Digital Solutions",
            description: "The page you are looking for could not be found.",
          });
    const origin = getSiteOrigin();
    const canonical = isPublicPage && origin ? `${origin}${path === "/" ? "/" : path}` : "";
    const imageUrl = origin ? `${origin}${socialImagePath}` : socialImagePath;

    document.title = page.title;
    setMeta("name", "description", page.description);
    setMeta(
      "name",
      "robots",
      isPublicPage ? "index,follow,max-image-preview:large" : "noindex,nofollow",
    );
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Haidry Digital Solutions");
    setMeta("property", "og:title", page.title);
    setMeta("property", "og:description", page.description);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:alt", "Haidry Digital Solutions — design, development and digital services");
    setMeta("property", "og:locale", "en_IN");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", page.title);
    setMeta("name", "twitter:description", page.description);
    setMeta("name", "twitter:image", imageUrl);
    setCanonical(canonical);

    let schema = document.getElementById("hds-structured-data");
    if (isPublicPage && origin) {
      if (!schema) {
        schema = document.createElement("script");
        schema.id = "hds-structured-data";
        schema.type = "application/ld+json";
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(createStructuredData(origin, path));
    } else {
      schema?.remove();
    }
  }, [pathname]);

  return null;
}
