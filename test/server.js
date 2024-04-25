let swatter = document.querySelector('.swatter')
let fly = document.querySelector('.fly')
let result = document.querySelector('.result')
let count = 0


document.addEventListener('mousemove', function (e) {
   swatter.style.left = `${+e.pageX - parseFloat(getComputedStyle(swatter).width) / 3}px`
   swatter.style.top = `${+e.pageY - parseFloat(getComputedStyle(swatter).width) / 3}px`
})


document.addEventListener('click', function() {
   count += 1
   result.innerHTML = count
   anime({
       targets: '.swatter',
       scale: 0.8,
       duration: 100,
       easing: 'easeInOutQuad',
       complete: function() {
           anime({
               targets: '.swatter',
               scale: 1,
               duration: 200,
               easing: 'easeInQuad'
           })
       }
   })


   anime({
       targets: '.fly',
       rotate: anime.random(90, 720),
       left: anime.random(0, window.innerWidth - 50),
       top: anime.random(0, window.innerHeight - 50),
       duration: anime.random(200, 1000),
       easing: 'easeOutQuad'
   })
})