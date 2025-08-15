import React, { useEffect, useState, useRef } from "react";

const CHALLENGE_PAGE = "https://tns4lpgmziiypnxxzel5ss5nyu0nftol.lambda-url.us-east-1.on.aws/challenge";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [flag, setFlag] = useState("");
  const [displayChars, setDisplayChars] = useState([]);
  const animatedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function getFlag() {
      try {
        const pageResp = await fetch(CHALLENGE_PAGE);
        const pageText = await pageResp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(pageText, "text/html");

        const candidates = Array.from(doc.querySelectorAll('b.ref[value]'));
        const sectionRe = /^92/;
        const articleRe = /45$/;
        const divRe = /78/;
        const results = [];

        for (const b of candidates) {
          const div = b.closest ? b.closest('div[data-tag]') : null;
          const article = div ? div.closest('article[data-class]') : null;
          const section = article ? article.closest('section[data-id]') : null;
          if (!div || !article || !section) continue;
          if (
            divRe.test(div.getAttribute('data-tag') || '') &&
            articleRe.test(article.getAttribute('data-class') || '') &&
            sectionRe.test(section.getAttribute('data-id') || '')
          ) {
            results.push(b.getAttribute('value') || '');
          }
        }

        const hidden = results.join('');
        let hiddenUrl = hidden;
        if (!/^https?:\/\//i.test(hiddenUrl)) {
          const base = new URL(CHALLENGE_PAGE).origin;
          if (!hiddenUrl.startsWith('/')) hiddenUrl = '/' + hiddenUrl;
          hiddenUrl = base + hiddenUrl;
        }

        const flagResp = await fetch(hiddenUrl);
        const flagText = await flagResp.text();

        if (!cancelled) {
          setFlag(flagText.trim());
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setFlag("(error loading flag)");
          setLoading(false);
        }
      }
    }

    getFlag();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!flag) return;
    if (animatedRef.current) return;
    animatedRef.current = true;

    let idx = 0;
    const chars = flag.split("");
    const interval = setInterval(() => {
      setDisplayChars((prev) => [...prev, chars[idx]]);
      idx += 1;
      if (idx >= chars.length) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [loading, flag]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {displayChars.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
