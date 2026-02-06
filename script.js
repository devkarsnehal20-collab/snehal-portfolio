// script.js - smooth scrolling, active nav highlighting, scroll reveal, and simple form handling

document.addEventListener('DOMContentLoaded', function(){
  // set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // NAV TOGGLE for small screens
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  toggle && toggle.addEventListener('click', ()=>{ links.classList.toggle('open'); });

  // Smooth scroll (anchors already use CSS scroll-behavior; this improves offset behavior if needed)
  document.querySelectorAll('a.nav-link').forEach(a=>{
    a.addEventListener('click', function(e){
      // close mobile nav when clicked
      if(links.classList.contains('open')) links.classList.remove('open');
    });
  });

  // Active link highlight using IntersectionObserver
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks).map(l=>document.querySelector(l.getAttribute('href'))).filter(Boolean);

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = document.querySelector('.nav-link[href="#'+id+'"]');
      if(entry.isIntersecting){
        navLinks.forEach(n=>n.classList.remove('active'));
        if(link) link.classList.add('active');
      }
    });
  },{root:null,rootMargin:'-35% 0px -40% 0px',threshold:0});

  sections.forEach(s=>s && obs.observe(s));

  // Scroll reveal for sections with alternating slide animations
  const allSections = document.querySelectorAll('.section');
  allSections.forEach((sec,i)=>{
    // add initial slide class alternating left/right
    sec.classList.add(i%2? 'slide-left':'slide-right');
  });
  const reveal = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        // unobserve after reveal
        reveal.unobserve(e.target);
      }
    });
  },{threshold:0.12});
  allSections.forEach(s=>reveal.observe(s));

  // Contact form handling (demo only) - prevents reload and shows message
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  form && form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if(!name||!email||!message){
      feedback.textContent = 'Please fill all fields.'; feedback.style.color='crimson'; return;
    }
    // In a real app we'd POST to an API. Here we simply show confirmation.
    feedback.style.color='green';
    feedback.textContent = 'Thanks, '+name+' — message received (demo).';
    form.reset();
    setTimeout(()=>feedback.textContent='','5000');
  });

  // Admin photo upload (client-side demo): save to localStorage and set avatar
  const photoInput = document.getElementById('photoInput');
  const savePhotoBtn = document.getElementById('savePhotoBtn');
  const avatar = document.querySelector('.avatar-shape');

  // load saved photo if present
  const saved = localStorage.getItem('profilePhoto');
  if(saved && avatar){ avatar.style.backgroundImage = `url(${saved})`; avatar.classList.add('has-photo'); }

  if(savePhotoBtn && photoInput){
    savePhotoBtn.addEventListener('click', ()=>{
      const file = photoInput.files[0];
      if(!file){ alert('Please choose an image file first.'); return; }
      const reader = new FileReader();
      reader.onload = function(e){
        const data = e.target.result;
        try{ localStorage.setItem('profilePhoto', data); }
        catch(err){ console.warn('Could not store image in localStorage:', err); }
        if(avatar){ avatar.style.backgroundImage = `url(${data})`; avatar.classList.add('has-photo'); }
        alert('Photo saved locally. Refresh will persist in this browser.');
      };
      reader.readAsDataURL(file);
    });
  }

  /* Admin panel: save/load editable demo content */
  const adminName = document.getElementById('adminName');
  const adminRole = document.getElementById('adminRole');
  const adminEmail = document.getElementById('adminEmail');
  const adminAbout = document.getElementById('adminAbout');
  const addProjectBtn = document.getElementById('addProjectBtn');
  const saveAdminBtn = document.getElementById('saveAdminBtn');
  const resetAdminBtn = document.getElementById('resetAdminBtn');
  const projTitle = document.getElementById('projTitle');
  const projTech = document.getElementById('projTech');
  const projDesc = document.getElementById('projDesc');
  const projectsGrid = document.querySelector('.projects-grid');

  // default data (used to reset)
  const defaultData = {
    name: 'Snehal Devgirikar',
    role: 'Aspiring Python Full Stack Developer',
    email: 'devkarsnehal20@gmail.com',
    about: 'Third-year BBA (Computer Applications) student currently enrolled in a professional Python Full Stack Development course. A fresher with a strong willingness to learn and build end-to-end web applications, with particular interest in backend systems and database-driven projects.',
    projects: [
      {title:'WedBliss — Wedding Planner (Academic)',desc:'Wedding planner website where users can browse and purchase budget-friendly wedding planning packages.',tech:'HTML, CSS, JavaScript'},
      {title:'Ecozi — Goes Green (Academic)',desc:'E-commerce website focused on eco-friendly products with product listings and cart prototype.',tech:'PHP, MySQL, HTML, CSS'},
      {title:'Portfolio Website (This Project)',desc:'Personal portfolio to present academic projects and skills with modern UI and responsive layout.',tech:'HTML, CSS, JavaScript'}
    ]
  };

  function loadAdminData(){
    const raw = localStorage.getItem('adminData');
    const data = raw? JSON.parse(raw) : defaultData;
    // populate site
    document.querySelector('.brand').textContent = data.name;
    const nameEl = document.querySelector('.name'); if(nameEl) nameEl.textContent = data.name;
    const roleEl = document.querySelector('.role'); if(roleEl) roleEl.textContent = data.role;
    const aboutEl = document.querySelector('.about-card p'); if(aboutEl) aboutEl.textContent = data.about;
    const emailLink = document.querySelector('.contact-info a[href^="mailto:"]'); if(emailLink) emailLink.textContent = data.email; if(emailLink) emailLink.href = 'mailto:'+data.email;
    // projects
    if(projectsGrid){
      projectsGrid.innerHTML = '';
      data.projects.forEach(p=>{
        const art = document.createElement('article'); art.className='card project-card glass';
        art.innerHTML = `<h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.desc)}</p><div class="project-tech">${escapeHtml(p.tech)}</div>`;
        projectsGrid.appendChild(art);
      });
    }
    // fill admin form
    if(adminName) adminName.value = data.name;
    if(adminRole) adminRole.value = data.role;
    if(adminEmail) adminEmail.value = data.email;
    if(adminAbout) adminAbout.value = data.about;
  }

  function saveAdminData(){
    const data = {
      name: adminName.value || defaultData.name,
      role: adminRole.value || defaultData.role,
      email: adminEmail.value || defaultData.email,
      about: adminAbout.value || defaultData.about,
      projects: []
    };
    // collect projects from DOM
    const cards = document.querySelectorAll('.projects-grid .project-card');
    cards.forEach(c=>{
      const t = c.querySelector('h3')?.textContent || '';
      const d = c.querySelector('p')?.textContent || '';
      const tech = c.querySelector('.project-tech')?.textContent || '';
      data.projects.push({title:t,desc:d,tech:tech});
    });
    localStorage.setItem('adminData', JSON.stringify(data));
    loadAdminData();
    alert('Admin demo data saved locally.');
  }

  function addProjectFromAdmin(){
    const title = projTitle.value.trim();
    const desc = projDesc.value.trim();
    const tech = projTech.value.trim();
    if(!title || !desc) { alert('Please provide title and description.'); return; }
    const art = document.createElement('article'); art.className='card project-card glass';
    art.innerHTML = `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p><div class="project-tech">${escapeHtml(tech)}</div>`;
    projectsGrid.appendChild(art);
    // clear inputs
    projTitle.value=''; projDesc.value=''; projTech.value='';
  }

  function resetDemoData(){
    if(confirm('Reset demo data to defaults? This will overwrite locally saved demo content.')){
      localStorage.removeItem('adminData');
      loadAdminData();
      alert('Demo data reset.');
    }
  }

  // helpers
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // wire up admin buttons
  addProjectBtn && addProjectBtn.addEventListener('click', addProjectFromAdmin);
  saveAdminBtn && saveAdminBtn.addEventListener('click', saveAdminData);
  resetAdminBtn && resetAdminBtn.addEventListener('click', resetDemoData);

  // initial load
  loadAdminData();

});
