// Site settings read by tools/build.js. The URL must stay in step with CNAME; gaId is the
// Google Analytics measurement ID added to every page.
module.exports = {
  url: 'https://www.hazwoperosha.com',
  // Brand name used in titles, og:site_name and the Organization JSON-LD; it matches the domain like the sister sites.
  brand: 'HazwoperOSHA.com',
  gaId: 'G-H2MZHM31RK',
  // Microsoft Clarity
  headExtra: `<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "z3cea3et53");
</script>
`,
};
