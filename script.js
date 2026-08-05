// Cursor
const cursor=document.getElementById('cursor'), ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
(function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();

// WebGL
(function(){
  const canvas=document.getElementById('webgl-bg');
  const gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');
  if(!gl){canvas.style.display='none';return;}
  function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;gl.viewport(0,0,canvas.width,canvas.height);}
  resize();window.addEventListener('resize',resize);
  const vs=`attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;
  const fs=`precision mediump float;uniform float u_t;uniform vec2 u_res;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=0.5;}return v;}
    void main(){
      vec2 uv=(gl_FragCoord.xy/u_res)*2.0-1.0;uv.x*=u_res.x/u_res.y;
      float t=u_t*0.012;
      vec2 q=vec2(fbm(uv+vec2(0.1,0.9)+t),fbm(uv+vec2(0.2,0.1)-t*0.8));
      vec2 r=vec2(fbm(uv+4.0*q+vec2(1.7,9.2)+t*1.1),fbm(uv+4.0*q+vec2(8.3,2.8)+t*0.9));
      float f=fbm(uv+4.0*r);
      vec3 c=mix(vec3(0.04,0.04,0.05),vec3(0.08,0.18,0.06),clamp(f*2.0,0.0,1.0));
      c=mix(c,vec3(0.18,0.18,0.06),clamp(length(q),0.0,1.0));
      c=mix(c,vec3(0.06,0.06,0.08),f*f*f*8.0);
      gl_FragColor=vec4(c,1.0);
    }`;
  function mkS(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  const prog=gl.createProgram();
  gl.attachShader(prog,mkS(gl.VERTEX_SHADER,vs));gl.attachShader(prog,mkS(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const aPos=gl.getAttribLocation(prog,'a_pos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
  const uT=gl.getUniformLocation(prog,'u_t'),uR=gl.getUniformLocation(prog,'u_res');
  let t=0;
  (function draw(){t+=0.5;gl.uniform1f(uT,t);gl.uniform2f(uR,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(draw);})();
})();

// Project modal
const projectModal = document.getElementById('project-modal-overlay');
const closeModalBtn = document.getElementById('project-modal-close');
const modalCategory = document.getElementById('project-modal-category');
const modalTitle = document.getElementById('project-modal-title');
const modalSummary = document.getElementById('project-modal-summary');
const modalRole = document.getElementById('project-modal-role');
const modalStack = document.getElementById('project-modal-stack');
const modalGithub = document.getElementById('project-modal-github');
const modalWebsite = document.getElementById('project-modal-website');
const modalImage = document.getElementById('project-modal-image');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');
const galleryCounter = document.getElementById('gallery-counter');
const certProofOverlay = document.getElementById('cert-proof-overlay');
const certProofCloseBtn = document.getElementById('cert-proof-close');
const certProofTitle = document.getElementById('cert-proof-title');
const certProofImage = document.getElementById('cert-proof-image');

let currentProjectImages = [];
let currentProjectImageIndex = 0;

function updateGallery(){
  if (!modalImage || currentProjectImages.length === 0) {
    modalImage.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
    galleryCounter.textContent = '1 / 1';
    return;
  }

  modalImage.src = currentProjectImages[currentProjectImageIndex];
  galleryCounter.textContent = `${currentProjectImageIndex + 1} / ${currentProjectImages.length}`;
}

function openProjectModal(card){
  modalCategory.textContent = card.dataset.category || 'Project';
  modalTitle.textContent = card.dataset.title || 'Project';
  modalSummary.textContent = card.dataset.description || '';
  modalRole.textContent = card.dataset.role || 'Creative development';
  modalStack.textContent = card.dataset.stack || 'Web technologies';
  

  if (card.dataset.github) {
    modalGithub.style.display = 'inline-block';
    modalGithub.href = card.dataset.github;
  } else {
    modalGithub.style.display = 'none';
  }

  const websiteUrl = card.dataset.website;
  if (websiteUrl) {
    modalWebsite.style.display = 'inline-block';
    modalWebsite.href = websiteUrl;
    

    if (websiteUrl.includes('drive.google.com')) {
      modalWebsite.textContent = 'Google Drive';
    } else {
      modalWebsite.textContent = 'Website';
    }
  } else {

    modalWebsite.style.display = 'none';
  }

  currentProjectImages = (card.dataset.images || '').split('|').map(s => s.trim()).filter(Boolean);
  currentProjectImageIndex = 0;
  
  updateGallery();
  projectModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal(){
  projectModal.classList.remove('open');
  document.body.style.overflow = '';
}

function openCertProof(card){
  if (!certProofOverlay || !certProofTitle || !certProofImage) return;
  certProofTitle.textContent = card.dataset.certTitle || 'Certificate';
  certProofImage.src = card.dataset.proof || '';
  certProofOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCertProof(){
  if (!certProofOverlay) return;
  certProofOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function goToProjectImage(direction){
  if (currentProjectImages.length === 0) return;
  currentProjectImageIndex = (currentProjectImageIndex + direction + currentProjectImages.length) % currentProjectImages.length;
  updateGallery();
}

document.querySelectorAll('#page-work .work-item').forEach(card => {
  card.addEventListener('click', () => openProjectModal(card));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProjectModal(card);
    }
  });
});

document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('click', () => openCertProof(card));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCertProof(card);
    }
  });
});

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeProjectModal);
}

if (certProofCloseBtn) {
  certProofCloseBtn.addEventListener('click', closeCertProof);
}

if (galleryPrev) {
  galleryPrev.addEventListener('click', () => goToProjectImage(-1));
}

if (galleryNext) {
  galleryNext.addEventListener('click', () => goToProjectImage(1));
}

if (projectModal) {
  projectModal.addEventListener('click', event => {
    if (event.target === projectModal) closeProjectModal();
  });
}

if (certProofOverlay) {
  certProofOverlay.addEventListener('click', event => {
    if (event.target === certProofOverlay) closeCertProof();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (projectModal && projectModal.classList.contains('open')) closeProjectModal();
    if (certProofOverlay && certProofOverlay.classList.contains('open')) closeCertProof();
  }

  if (projectModal && projectModal.classList.contains('open') && currentProjectImages.length > 0) {
    if (event.key === 'ArrowLeft') goToProjectImage(-1);
    if (event.key === 'ArrowRight') goToProjectImage(1);
  }
});

// Nav scroll
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('scrolled',window.scrollY>40));

// Navigation
let current='home';
function navigate(page){
  if(page===current)return;
  const overlay=document.getElementById('page-transition');
  overlay.style.transition='transform .35s cubic-bezier(0.45,0,0.55,1)';
  overlay.style.transformOrigin='bottom';overlay.style.transform='scaleY(1)';
  setTimeout(()=>{
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active','visible'));
    const next=document.getElementById('page-'+page);
    if(next){next.classList.add('active');current=page;window.scrollTo(0,0);
      overlay.style.transformOrigin='top';overlay.style.transform='scaleY(0)';
      setTimeout(()=>{next.classList.add('visible');setupReveal();},50);
    }
  },350);
  return false;
}

// Init
setTimeout(()=>{document.getElementById('page-home').classList.add('visible');setupReveal();},100);

// Reveal
function setupReveal(){
  const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>{el.classList.remove('visible');obs.observe(el);});
}

// Submit
// Submit
async function handleSubmit(event){
  // Prevent the default page reload behavior
  event.preventDefault(); 
  
  const form = event.target;
  const btn = document.querySelector('.submit-btn');
  const originalText = btn.textContent;
  
  // Show a loading state
  btn.textContent = 'Sending...';
  btn.style.pointerEvents = 'none';

  try {
    // REPLACE this URL with the endpoint provided by Formspree, Web3Forms, etc.
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      // Your original success animation
      btn.textContent = "✓ Sent! I'll be in touch within 24 hours.";
      btn.style.background = '#3a6b0e';
      btn.style.color = '#c8f53b';
      
      // Clear the form inputs
      form.reset(); 
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.pointerEvents = 'auto';
      }, 4000);
    } else {
      throw new Error("Network response was not ok.");
    }
  } catch (error) {
    btn.textContent = "Oops! Something went wrong.";
    btn.style.pointerEvents = 'auto';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 4000);
  }
}

// Marquee keyframe (inline since @keyframes can't be in style attr)
const style=document.createElement('style');
style.textContent='@keyframes marqueeScroll{to{transform:translateX(-50%)}}';
document.head.appendChild(style);
