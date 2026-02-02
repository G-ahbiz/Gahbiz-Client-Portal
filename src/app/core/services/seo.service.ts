import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private router = inject(Router);

  private defaultTitle = 'Servabest - Professional Home Services at Your Doorstep';
  private defaultDescription =
    'Book trusted professional services for your home. Cleaning, maintenance, repairs and more. Quality service providers, affordable prices, quick booking.';
  private defaultImage = 'https://www.servabest.com/assets/images/logo/servabest-og-image.jpg';
  private defaultKeywords =
    'home services, professional services, service booking, cleaning services, maintenance, repairs, home improvement, service providers, Servabest';
  private baseUrl = 'https://www.servabest.com';

  constructor() {
    // Update canonical URL on route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateCanonicalUrl(this.baseUrl + event.urlAfterRedirects);
      });
  }

  /**
   * Updates all meta tags for SEO
   */
  updateMetaTags(data: SeoData) {
    const title = data.title || this.defaultTitle;
    const description = data.description || this.defaultDescription;
    const keywords = data.keywords || this.defaultKeywords;
    const image = data.image || this.defaultImage;
    const url = data.url || this.baseUrl + this.router.url;
    const type = data.type || 'website';

    // Update page title
    this.titleService.setTitle(title);

    // Standard meta tags
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ name: 'author', content: data.author || 'Servabest' });

    // Open Graph / Facebook
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: 'Servabest' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:url', content: url });

    // Article specific tags
    if (type === 'article') {
      if (data.publishedTime) {
        this.meta.updateTag({ property: 'article:published_time', content: data.publishedTime });
      }
      if (data.modifiedTime) {
        this.meta.updateTag({ property: 'article:modified_time', content: data.modifiedTime });
      }
    }

    // Update canonical URL
    this.updateCanonicalUrl(url);
  }

  /**
   * Updates canonical URL
   */
  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Adds structured data (JSON-LD) to the page
   */
  addStructuredData(data: any) {
    let script: HTMLScriptElement | null = document.querySelector(
      'script[type="application/ld+json"]#dynamic-schema',
    );

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'dynamic-schema';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }

  /**
   * Removes dynamic structured data
   */
  removeStructuredData() {
    const script = document.querySelector('script[type="application/ld+json"]#dynamic-schema');
    if (script) {
      script.remove();
    }
  }

  /**
   * Creates BreadcrumbList structured data
   */
  createBreadcrumbs(items: { name: string; url: string }[]) {
    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: this.baseUrl + item.url,
      })),
    };

    this.addStructuredData(breadcrumbs);
  }

  /**
   * Creates Service structured data
   */
  createServiceSchema(service: {
    name: string;
    description: string;
    image: string;
    price?: string;
    provider?: string;
  }) {
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: service.name,
      name: service.name,
      description: service.description,
      image: service.image,
      provider: {
        '@type': 'Organization',
        name: service.provider || 'Servabest',
      },
    };

    if (service.price) {
      (serviceSchema as any).offers = {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'USD',
      };
    }

    this.addStructuredData(serviceSchema);
  }

  /**
   * Predefined SEO data for common pages
   */
  getPageSeoData(pageName: string): SeoData {
    const seoData: { [key: string]: SeoData } = {
      home: {
        title: 'Servabest - Professional Home Services at Your Doorstep',
        description:
          'Book trusted professional services for your home. Cleaning, maintenance, repairs and more. Quality service providers, affordable prices, quick booking.',
        keywords:
          'home services, professional services, service booking, cleaning services, maintenance, repairs',
      },
      allServices: {
        title: 'All Services - Servabest',
        description:
          'Browse all available home services. From cleaning to repairs, find the perfect service provider for your needs.',
        keywords:
          'all services, home services, cleaning, maintenance, repairs, professional services',
      },
      about: {
        title: 'About Us - Servabest',
        description:
          'Learn about Servabest and our mission to connect you with the best service providers for your home.',
        keywords: 'about servabest, our mission, home services platform',
      },
      contact: {
        title: 'Contact Us - Servabest',
        description:
          "Get in touch with Servabest. We're here to help with any questions about our services.",
        keywords: 'contact servabest, customer support, help',
      },
      faq: {
        title: 'Frequently Asked Questions - Servabest',
        description: 'Find answers to common questions about booking services, payments, and more.',
        keywords: 'faq, questions, help, support, servabest',
      },
      cart: {
        title: 'Shopping Cart - Servabest',
        description: 'Review your selected services and proceed to checkout.',
        keywords: 'shopping cart, checkout, book services',
      },
      wishlist: {
        title: 'My Wishlist - Servabest',
        description: 'View and manage your saved services.',
        keywords: 'wishlist, saved services, favorites',
      },
    };

    return (
      seoData[pageName] || {
        title: this.defaultTitle,
        description: this.defaultDescription,
        keywords: this.defaultKeywords,
      }
    );
  }
}
