document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); // Debug to confirm script runs

    // XLSX file handling
    var gk_isXlsx = false;
    var gk_xlsxFileLookup = {};
    var gk_fileData = {};

    function filledCell(cell) {
        return cell !== '' && cell != null;
    }

    function loadFileData(filename) {
        if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
            try {
                var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
                var filteredData = jsonData.filter(row => row.some(filledCell));
                var headerRowIndex = filteredData.findIndex((row, index) =>
                    row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
                );
                if (headerRowIndex === -1 || headerRowIndex > 25) {
                    headerRowIndex = 0;
                }
                var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
                csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
                return csv;
            } catch (e) {
                console.error('XLSX Error:', e);
                return "";
            }
        }
        return gk_fileData[filename] || "";
    }

    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
                const navBar = document.querySelector('nav');
                const navBarHeight = navBar ? navBar.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - navBarHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Class toggle
    const classToggle = document.querySelector('#class-toggle');
    const switchSpan = document.querySelector('.switch');
    if (classToggle && switchSpan) {
        classToggle.addEventListener('change', () => {
            document.body.classList.toggle('scb-mode', classToggle.checked);
        });
        switchSpan.addEventListener('click', () => {
            classToggle.checked = !classToggle.checked;
            classToggle.dispatchEvent(new Event('change'));
        });
    }

    // Scroll animations
    const sections = document.querySelectorAll('section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    console.log('Sections found:', sections.length); // Debug
    console.log('Timeline items found:', timelineItems.length); // Debug

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        console.log('Observer triggered', entries); // Debug
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Fallback for unsupported IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported, applying visible class to all elements');
        sections.forEach(section => section.classList.add('visible'));
        timelineItems.forEach(item => item.classList.add('visible'));
    } else {
        sections.forEach(section => observer.observe(section));
        timelineItems.forEach(item => observer.observe(item));
    }
});