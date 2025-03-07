
let header= document.querySelector('header');


window.addEventListener('scroll',()=> {
    header.classList.toggle('shadow',window.scrollY> 0);

});
//  Menu
let menu= document.querySelector('#menu-icon');
let navbar= document.querySelector('.navbar');

menu.onclick = () => { //Evento click muestre boton x
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');

}
window.onscroll= () =>{//Evento click muestre boton x
    menu.classList.remove('bx-x');
    navbar.classList.remove('active')
}
//Scroll Reveal Animation
const sr = ScrollReveal({
    origin:'top', 
    distance: '60px'  ,
    duration: 8000,
    delay:400,
    //reset: true
}) //Pone las animaciones dependiendo en donde se requiera
sr.reveal('.home-text, .buds-text',{origin: 'left'});
sr.reveal('.home-img,.buds-img',{origin: 'right'});
sr.reveal('.heading',{delay: 200});
sr.reveal('.specs-details .box',{origin: 'left', interval:200});
sr.reveal('.space-img',{delay: 600});
sr.reveal('.shop-container .box,.footer .logo,.footer,.footer-box',{interval:150})