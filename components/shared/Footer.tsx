import { Sparkles } from "lucide-react";
import { FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Lexicon</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Lexicon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
