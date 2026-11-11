export interface ContentPageSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ContentPage {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: ContentPageSection[];
}

export const contentPages: Record<string, ContentPage> = {
  help: {
    slug: "help",
    title: "Help Center",
    description: "Get help with shopping, payments, delivery, order tracking, returns and your OneHaatbd account.",
    intro: "Find clear guidance for common shopping questions. If you need help with a specific order, contact our customer service team with your order number.",
    sections: [
      { heading: "Placing an order", paragraphs: ["Browse products, add your selections to the cart and follow checkout to provide your delivery details and choose an available payment method."] },
      { heading: "Delivery and order updates", paragraphs: ["Delivery timing and charges can vary by location and product. Check the information shown at checkout, and use Track Order or contact us if you need an update."] },
      { heading: "Returns and support", paragraphs: ["If an item arrives damaged, incorrect or otherwise needs attention, contact us as soon as possible with your order number and a description of the issue."], bullets: ["Track an order on our Track Order page.", "Review eligibility and next steps on Returns & Exchanges.", "For other questions, use the Contact Us page."] },
    ],
  },
  "order-status": {
    slug: "order-status",
    title: "Track Your Order",
    description: "Learn how to check the latest status of your OneHaatbd order and contact customer service for help.",
    intro: "We want you to know what is happening with your purchase. Keep your order number available when asking our team for a delivery update.",
    sections: [
      { heading: "Check your order", paragraphs: ["Sign in and open your orders to review available order details and status updates. If you checked out as a guest or cannot access your account, contact customer service with the phone number used at checkout and your order number."] },
      { heading: "Delivery updates", paragraphs: ["Order preparation and delivery times may vary by product and destination. We will share updates when they are available. If an expected update has not arrived, contact us so we can help."] },
    ],
  },
  "shipping-info": {
    slug: "shipping-info",
    title: "Shipping Information",
    description: "Read about OneHaatbd delivery areas, shipping charges, delivery timing and order updates in Bangladesh.",
    intro: "OneHaatbd arranges delivery across available locations in Bangladesh. The delivery options, estimated timing and applicable charge are shown during checkout when available.",
    sections: [
      { heading: "Delivery estimates", paragraphs: ["Delivery estimates are indicative and can depend on your address, product availability, seller, courier capacity and local conditions. Some orders may arrive in separate shipments."] },
      { heading: "Shipping charges", paragraphs: ["Any applicable delivery charge is shown before you place your order. Review your checkout summary to confirm the final amount."] },
      { heading: "Receiving your order", paragraphs: ["Please provide an accurate address and a reachable phone number. If delivery is delayed or your parcel has an issue, contact us with your order number."] },
    ],
  },
  returns: {
    slug: "returns",
    title: "Returns & Exchanges",
    description: "Learn how to contact OneHaatbd about an item that arrived damaged, incorrect or needs return assistance.",
    intro: "Need help with an item? Contact us promptly so we can review the order and explain the next steps. Return or exchange availability can depend on the item and its condition.",
    sections: [
      { heading: "Request help", paragraphs: ["Contact customer service with your order number, the item name and a short description of the issue. For damage or an incorrect item, include clear photos when possible."] },
      { heading: "Item condition", paragraphs: ["Keep the item, packaging, labels and included accessories together while your request is reviewed. Please wait for instructions before sending an item back."] },
      { heading: "Review and resolution", paragraphs: ["Our team will review the details and let you know whether a return, replacement, exchange or another resolution is available for your order."] },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact Us",
    description: "Contact OneHaatbd customer service for help with orders, delivery, returns and shopping questions.",
    intro: "Our customer service team can help with shopping questions and order issues. For faster support, include your order number and the phone number used at checkout.",
    sections: [
      { heading: "Customer service", paragraphs: ["Call or email us using the contact details below. Please describe what you need help with and include any relevant order information."] },
      { heading: "Business address", paragraphs: ["You can find our listed business address below. Please contact us before visiting, as in-person service hours may vary."] },
    ],
  },
  about: {
    slug: "about",
    title: "About OneHaatbd",
    description: "Learn about OneHaatbd, an online marketplace helping customers discover products and shop in Bangladesh.",
    intro: "OneHaatbd is an online shopping destination where customers can discover products from a range of categories and place orders for delivery in Bangladesh.",
    sections: [
      { heading: "A simpler way to shop", paragraphs: ["We bring product discovery, shopping and order information together in one place, so customers can browse, compare and choose items that suit their needs."] },
      { heading: "Our marketplace", paragraphs: ["Product availability, descriptions, pricing and delivery options can vary. Please review the information on each product page and at checkout before placing an order."] },
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers at OneHaatbd",
    description: "Find information about career opportunities and how to contact OneHaatbd about working with our team.",
    intro: "We appreciate your interest in working with OneHaatbd. This page will share opportunities when openings are available.",
    sections: [
      { heading: "Current opportunities", paragraphs: ["There are no job listings published on this page right now. Please check back later for updates."] },
      { heading: "Get in touch", paragraphs: ["For general enquiries about working with us, email our team with the subject “Careers” and a short introduction."] },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    description: "Read the terms for using OneHaatbd and placing orders through our online shopping website.",
    intro: "These terms describe basic conditions for using the OneHaatbd website and placing an order. By using the site, you agree to follow applicable laws and use the service responsibly.",
    sections: [
      { heading: "Website information", paragraphs: ["We work to keep product, pricing and availability information accurate. Details may change, and an order may require confirmation if an item or price is unavailable or incorrect."] },
      { heading: "Orders and payment", paragraphs: ["An order request is subject to availability and confirmation. The payable total and available payment options are shown during checkout. Please provide accurate contact and delivery information."] },
      { heading: "Responsible use", paragraphs: ["Do not misuse the website, interfere with its operation or submit information that is unlawful or misleading. Website content may not be copied for commercial use without permission."] },
      { heading: "Questions", paragraphs: ["For questions about an order or these terms, contact our customer service team. These terms may be updated as our services change."] },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "Learn how OneHaatbd uses customer information to process orders, provide support and improve its shopping service.",
    intro: "We use information you provide to operate the website, process orders and support customers. This page explains the main ways information may be handled when you use OneHaatbd.",
    sections: [
      { heading: "Information we use", paragraphs: ["Depending on how you use the service, information may include your name, contact details, delivery address, order details and messages sent to customer service."] },
      { heading: "Why we use it", paragraphs: ["We use information to manage accounts and orders, arrange delivery, respond to requests, protect the service and meet legal obligations. Relevant information may be shared with service providers involved in payment, delivery, hosting or customer support."] },
      { heading: "Your choices and questions", paragraphs: ["Keep your account and contact details accurate, and avoid sending sensitive information that is not needed to help with your request. Contact us with questions about your information or this policy."] },
      { heading: "Policy updates", paragraphs: ["We may update this page when our practices or services change. The latest version will be published here."] },
    ],
  },
  blog: {
    slug: "blog",
    title: "OneHaatbd Blog",
    description: "Visit the OneHaatbd blog for shopping guides, product tips and updates when new articles are published.",
    intro: "The OneHaatbd blog is where we will share shopping guides, product tips and marketplace updates.",
    sections: [
      { heading: "Articles coming soon", paragraphs: ["There are no articles published here yet. Browse our categories and products while we prepare future guides and updates."] },
    ],
  },
};
