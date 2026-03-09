const footerLinks = {
  Product: ["Features", "Pricing", "Demo", "Changelog"],
  Developers: ["Documentation", "API Reference", "SDKs", "Status"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Security"],
};

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-label-sm text-foreground font-semibold uppercase tracking-wider">
                {category}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-body text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border-subtle flex items-center justify-between">
          <span className="text-label-sm text-text-muted">
            &copy; {new Date().getFullYear()} Blueprint.dev. All rights reserved.
          </span>
          <span className="font-satoshi text-sm font-bold text-foreground">
            Blueprint<span className="text-primary">.dev</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
