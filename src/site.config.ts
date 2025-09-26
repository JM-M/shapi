const siteConfig = {
  name: "Shapi",
  description: "Shapi is a tool for managing your OpenAPI/Swagger API",
  version: "0.1.0",
  author: "JMM",
  license: "MIT",
  website: "https://shapi.com",
  keywords: ["shapi", "api", "swagger", "openapi"],
  logo: "/logo.png",
  // Metadata for browser UI
  metadata: {
    title: {
      default: "Shapi - OpenAPI/Swagger API Management Tool",
      template: "%s | Shapi",
    },
    description:
      "Shapi is a powerful tool for managing, testing, and documenting your OpenAPI/Swagger APIs. Streamline your API development workflow with our intuitive interface.",
    keywords: [
      "shapi",
      "api",
      "swagger",
      "openapi",
      "api management",
      "api testing",
      "api documentation",
      "rest api",
      "api development",
    ],
    authors: [{ name: "JMM" }],
    creator: "JMM",
    publisher: "Shapi",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://shapi.com",
      siteName: "Shapi",
      title: "Shapi - OpenAPI/Swagger API Management Tool",
      description:
        "Shapi is a powerful tool for managing, testing, and documenting your OpenAPI/Swagger APIs. Streamline your API development workflow with our intuitive interface.",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "Shapi Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shapi - OpenAPI/Swagger API Management Tool",
      description:
        "Shapi is a powerful tool for managing, testing, and documenting your OpenAPI/Swagger APIs.",
      images: ["/logo.png"],
      creator: "@shapi",
    },
    verification: {
      google: "your-google-verification-code", // Replace with actual verification code
    },
    alternates: {
      canonical: "https://shapi.com",
    },
  },
};

export default siteConfig;
