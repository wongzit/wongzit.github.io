// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-cv",
          title: "cv",
          description: "about ZW",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-research",
          title: "research",
          description: "研究内容",
          section: "Navigation",
          handler: () => {
            window.location.href = "/research/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "公表論文",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-presentations",
          title: "presentations",
          description: "学会発表",
          section: "Navigation",
          handler: () => {
            window.location.href = "/presentations/";
          },
        },{id: "dropdown-py-aroma",
              title: "py.Aroma",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/program/pyaroma/";
              },
            },{id: "dropdown-uv-plotter",
              title: "uv.Plotter",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/program/uvplotter/";
              },
            },{id: "dropdown-scripts",
              title: "scripts",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/program/script/";
              },
            },{id: "nav-teaching",
          title: "teaching",
          description: "授業",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "nav-links",
          title: "links",
          description: "リンク",
          section: "Navigation",
          handler: () => {
            window.location.href = "/links/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "post-orbital-composition-analysis",
        
          title: "Orbital Composition Analysis",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/orbital-composition-analysis/";
          
        },
      },{id: "post-list-of-all-posts",
        
          title: "List of All Posts",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/list-of-all-posts/";
          
        },
      },{id: "post-a-new-3d-nics-method-based-on-esp-mapping",
        
          title: "A New 3D NICS Method Based on ESP Mapping",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/a-new-3d-nics-method-based-on-esp-mapping/";
          
        },
      },{id: "post-gaussian-16-calculation-task-continuation",
        
          title: "Gaussian 16 Calculation Task Continuation",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/gaussian-calculation-task-continuation/";
          
        },
      },{id: "post-py-aroma-version-4-update",
        
          title: "py.Aroma Version 4 Update",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/pyaroma-version-4-update/";
          
        },
      },{id: "post-analyze-intermolecular-interactions-by-sapt",
        
          title: "Analyze Intermolecular Interactions by SAPT",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/analyze-intermolecular-interactions-by-sapt/";
          
        },
      },{id: "post-computing-charge-transfer-rate-based-on-marcus-theory-using-gaussian",
        
          title: "Computing Charge Transfer Rate Based on Marcus Theory Using Gaussian",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/computing-charge-transfer-rate-based-on-marcus-theory-using-gaussian/";
          
        },
      },{id: "post-hartree-fock-exchange-of-dft-functionals",
        
          title: "Hartree-Fock Exchange of DFT Functionals",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/hartree-fock-exchange-of-dft-functionals/";
          
        },
      },{id: "post-natural-transition-orbitals-nto-analysis",
        
          title: "Natural Transition Orbitals (NTO) Analysis",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/natural-transition-orbitals-(nto)-analysis/";
          
        },
      },{id: "post-impact-factor-2022",
        
          title: "Impact Factor 2022",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/impact-factor-2022/";
          
        },
      },{id: "post-memo-install-gaussian-and-gaussview-on-linux-machine",
        
          title: "MEMO: Install Gaussian and GaussView on Linux Machine",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/memo-install-gaussian-and-gaussview-on-linux-machine/";
          
        },
      },{id: "post-evaluating-dissected-nics-with-nbo-program",
        
          title: "Evaluating Dissected NICS with NBO Program",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/evaluating-dissected-nics-with-nbo-program/";
          
        },
      },{id: "post-install-dalton-on-linux-machine",
        
          title: "Install Dalton on Linux Machine",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/install-dalton-on-linux-machine/";
          
        },
      },{id: "post-calculation-of-solvation-free-energy",
        
          title: "Calculation of Solvation Free Energy",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/calculation-of-solvation-free-energy/";
          
        },
      },{id: "post-gaumonitor-v3-0-0-update",
        
          title: "gauMonitor v3.0.0 Update",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/gaumonitor-v3-update/";
          
        },
      },{id: "post-nmr-prediction-with-scaling-factors",
        
          title: "NMR Prediction with Scaling Factors",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/nmr-prediction-with-scaling-factors/";
          
        },
      },{id: "post-manual-for-calculating-nics-with-nbo-program",
        
          title: "Manual for Calculating NICS with NBO Program",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/manual-for-calculating-nics-with-nbo-program/";
          
        },
      },{id: "post-pyaroma-a-multifunction-aromaticity-analyser",
        
          title: "pyAroma: A Multifunction Aromaticity Analyser",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/pyaroma-a-multifunction-aromaticity-analyzer/";
          
        },
      },{id: "post-install-gaussian-16-on-a-mac",
        
          title: "Install Gaussian 16 on a Mac",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/install-gaussian-16-on-a-mac/";
          
        },
      },{id: "post-install-orca-5-on-linux-machine",
        
          title: "Install ORCA 5 on Linux Machine",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/install-orca-5-on-linux-machine/";
          
        },
      },{id: "post-memo-simulation-of-epr-spectrum-with-easyspin",
        
          title: "MEMO: Simulation of EPR Spectrum with EasySpin",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/memo-simulation-of-epr-spectrum-with-easyspin/";
          
        },
      },{id: "post-methods-to-solve-the-scf-not-converged",
        
          title: "Methods to Solve the SCF not Converged",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/method-to-solve-the-scf-not-converged/";
          
        },
      },{id: "post-prepare-supporting-information-with-csigen",
        
          title: "Prepare Supporting Information with CSIgen",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/prepare-supporting-information-with-csigen/";
          
        },
      },{id: "post-3d-icss-analyses-with-icssgen3d-and-icsscub3d",
        
          title: "3D-ICSS Analyses with ICSSgen3D and ICSScub3D",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/3d-icss-analyses-with-icssgen3d-and-icsscub3d/";
          
        },
      },{id: "post-gaussian-common-errors-and-solutions",
        
          title: "Gaussian Common Errors and Solutions",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/gaussian-common-errors-and-solutions/";
          
        },
      },{id: "post-visualization-of-aromaticity-gimic",
        
          title: "Visualization of Aromaticity: GIMIC",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/visualization-of-aromaticity-gimic/";
          
        },
      },{id: "post-visualization-of-aromaticity-aicd",
        
          title: "Visualization of Aromaticity: AICD",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/visualization-of-aromaticity-aicd/";
          
        },
      },{id: "post-enepro-a-python-program-for-drawing-energy-profile",
        
          title: "EnePro: A Python Program for Drawing Energy Profile",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/enepro-a-python-program-for-drawing-energy-profile/";
          
        },
      },{id: "post-nics-analyses-with-nicsgen",
        
          title: "NICS Analyses with NICSgen",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/nics-analyses-with-nicsgen/";
          
        },
      },{id: "post-homa-calculation-with-homacalc",
        
          title: "HOMA Calculation with HOMAcalc",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/homa-calculation-with-homacalc/";
          
        },
      },{id: "post-diradical-character-calculation",
        
          title: "Diradical Character Calculation",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/diradical-character-calculation/";
          
        },
      },{id: "post-2d-icss-analyses-with-icssgen-and-icsscsv",
        
          title: "2D-ICSS Analyses with ICSSgen and ICSScsv",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/2d-icss-analyses-with-icssgen-and-icsscsv/";
          
        },
      },{id: "post-epr-prediction-with-orca-program",
        
          title: "EPR Prediction with ORCA Program",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/epr-prediction-with-orca-program/";
          
        },
      },{id: "post-plot-odd-electron-density",
        
          title: "Plot Odd Electron Density",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/plot-odd-electron-density/";
          
        },
      },{id: "news-z-w-will-attend-isna-20-at-toronto-and-give-poster-presentation",
          title: 'Z.W. will attend ISNA-20 at Toronto and give poster presentation.',
          description: "",
          section: "News",},{id: "news-25-7k-visitors-in-last-month",
          title: '25.7k visitors in last month.',
          description: "",
          section: "News",},{id: "news-z-w-attended-isna-20-thank-you-all-for-coming-to-my-poster-presentation",
          title: 'Z.W. attended ISNA-20, thank you all for coming to my poster presentation.',
          description: "",
          section: "News",},{id: "news-27-4k-visitors-in-last-month",
          title: '27.4k visitors in last month.',
          description: "",
          section: "News",},{id: "news-reached-100-citations",
          title: 'Reached 100 citations.',
          description: "",
          section: "News",},{id: "news-30k-visitors-in-last-month",
          title: '30k visitors in last month.',
          description: "",
          section: "News",},{id: "news-31-8k-visitors-in-last-month",
          title: '31.8k visitors in last month.',
          description: "",
          section: "News",},{id: "news-29-5k-visitors-in-last-month",
          title: '29.5k visitors in last month.',
          description: "",
          section: "News",},{id: "news-a-note-on-py-aroma-has-been-accepted-by-chemistry-mdpi",
          title: 'A note on py.Aroma has been accepted by Chemistry (MDPI).',
          description: "",
          section: "News",},{id: "news-happy-new-year-and-thanks-for-306k-visits-in-2024",
          title: 'Happy new year! And thanks for 306k visits in 2024!',
          description: "",
          section: "News",},{id: "news-a-bug-fix-release-of-py-aroma-version-4-2-is-now-available",
          title: 'A bug-fix release of py.Aroma (version 4.2) is now available.',
          description: "",
          section: "News",},{id: "news-39-6k-visitors-in-last-month",
          title: '39.6k visitors in last month.',
          description: "",
          section: "News",},{id: "news-44-6k-visitors-in-last-month",
          title: '44.6k visitors in last month.',
          description: "",
          section: "News",},{id: "news-39-9k-visitors-in-last-month",
          title: '39.9k visitors in last month.',
          description: "",
          section: "News",},{id: "news-our-latest-work-on-has-been-published-on-chemrxiv-check-here",
          title: 'Our latest work on has been published on ChemRxiv! Check here.',
          description: "",
          section: "News",},{id: "news-zw-will-join-uosaka-from-august-1st",
          title: 'ZW will join UOsaka from August 1st.',
          description: "",
          section: "News",},{id: "news-40-1k-visitors-in-last-month",
          title: '40.1k visitors in last month.',
          description: "",
          section: "News",},{id: "news-37k-visitors-in-last-month",
          title: '37k visitors in last month.',
          description: "",
          section: "News",},{id: "news-zw-attended-annual-meeting-on-photochemistry-2025",
          title: 'ZW attended Annual Meeting on Photochemistry 2025.',
          description: "",
          section: "News",},{id: "news-zw-attended-the-35th-symposium-on-poc",
          title: 'ZW attended the 35th Symposium on POC!',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_20/";
            },},{id: "news-notice-the-pages-are-currently-under-construction",
          title: 'NOTICE: The pages are currently under construction.',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%77%61%6E%67.%7A%68%65.%64%72@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-bluesky',
        title: 'Bluesky',
        section: 'Socials',
        handler: () => {
          window.open("https://bsky.app/profile/wangzhe.bsky.social", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/oooooootetsu", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/wongzit", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0002-9996-586X", "_blank");
        },
      },{
        id: 'social-publons',
        title: 'Publons',
        section: 'Socials',
        handler: () => {
          window.open("https://publons.com/a/JLL-8000-2023/", "_blank");
        },
      },{
        id: 'social-researchgate',
        title: 'ResearchGate',
        section: 'Socials',
        handler: () => {
          window.open("https://www.researchgate.net/profile/Zhe-Wang-84/", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=gzUh6CMAAAAJ", "_blank");
        },
      },{
        id: 'social-scopus',
        title: 'Scopus',
        section: 'Socials',
        handler: () => {
          window.open("https://www.scopus.com/authid/detail.uri?authorId=57203902612", "_blank");
        },
      },{
        id: 'social-wechat_qr',
        title: 'Wechat_qr',
        section: 'Socials',
        handler: () => {
          window.open("", "_blank");
        },
      },{
        id: 'social-work',
        title: 'Work',
        section: 'Socials',
        handler: () => {
          window.open("https://rd.iai.osaka-u.ac.jp/ja/137af188b80be1cd.html", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
