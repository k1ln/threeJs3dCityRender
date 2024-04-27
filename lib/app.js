/*setTimeout(()=>{
            var strMime = "image/png";
            var imgData = renderer.domElement.toDataURL(strMime);
            var link = document.createElement('a');
            link.download = 'filename.png';
            link.href = imgData;
            link.click();
            location.reload();
        },10000);
        */
        window.addEventListener("keyup", event => {
        if (event.keyCode === 37) {
            cam.position.z += 1; 
            return;
        }
        if (event.keyCode === 38) {
            cam.position.x += 1; 
            return;
        }
        if (event.keyCode === 39) {
            cam.position.z -= 1; 
            return;
        }
        if (event.keyCode === 40) {
            cam.position.x -= 1; 
            return;
        }
        if (event.keyCode === 64) {
            cam.position.y += 1; 
            return;
        }
        if (event.keyCode === 89) {
            cam.position.y -= 1; 
            return;
        }


        console.log(cam.position);
        // do something
        });
        const fragmentShader = `
        uniform vec3 color;
        uniform float coefficient;
        uniform float power;
        varying vec3 vVertexNormal;
        varying vec3 vVertexWorldPosition;
        void main() {
        vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
        vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
        viewCameraToVertex = normalize(viewCameraToVertex);
        float intensity	= pow(
            coefficient + dot(vVertexNormal, viewCameraToVertex),
            power
        );
        gl_FragColor = vec4(color, intensity);
        }`;

        const vertexShader = `
        varying vec3 vVertexWorldPosition;
        varying vec3 vVertexNormal;
        void main() {
        vVertexNormal	= normalize(normalMatrix * normal);
        vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `;

        const defaultOptions = {
        backside: true,
        coefficient: 0.5,
        color: 'gold',
        size: 2,
        power: 1,
        };

        // Based off: http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
        function createGlowMaterial(coefficient, color, power) {
        return new THREE.ShaderMaterial({
            depthWrite: false,
            fragmentShader,
            transparent: true,
            uniforms: {
            coefficient: {
                value: coefficient,
            },
            color: {
                value: new THREE.Color(color),
            },
            power: {
                value: power,
            },
            },
            vertexShader,
        });
        }



        const pSBC=(p,c0,c1,l)=>{
            let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
            if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
            if(!this.pSBCr)this.pSBCr=(d)=>{
                let n=d.length,x={};
                if(n>9){
                    [r,g,b,a]=d=d.split(","),n=d.length;
                    if(n<3||n>4)return null;
                    x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
                }else{
                    if(n==8||n==6||n<4)return null;
                    if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
                    d=i(d.slice(1),16);
                    if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
                    else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
                }return x};
            h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
            if(!f||!t)return null;
            if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
            else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
            a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
            if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
            else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
        }
        var cam, scene, renderer,gb_plane,
        clock, smokeMaterial,gblight,controls,
        h, w,colors,
        cloudtextures = [];
        smokeParticles = [];
        textures = [];
        materials = [];
        parks = [];
        lightnings = [];
        var rayDirection = new THREE.Vector3( 0, - 1, 0 );
        first = true;
        var vertex = `uniform float rotation;
            uniform vec2 center;
            #include <common>
            #include <uv_pars_vertex>
            #include <fog_pars_vertex>
            #include <logdepthbuf_pars_vertex>
            #include <clipping_planes_pars_vertex>

            varying vec2 vUv;

            void main() {
                // #include <uv_vertex>
            vUv = uv;

                vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
                vec2 scale;
                scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
                scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

                vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
                vec2 rotatedPosition;
                rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
                rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
                mvPosition.xy += rotatedPosition;
                gl_Position = projectionMatrix * mvPosition;
                #include <logdepthbuf_vertex>
                #include <clipping_planes_vertex>
                #include <fog_vertex>
            }`; 
        var fragment = `
            uniform sampler2D uTxtShape;
            uniform sampler2D uTxtCloudNoise;
            uniform float uTime;

            uniform float uFac1;
            uniform float uFac2;
            uniform float uTimeFactor1;
            uniform float uTimeFactor2;
            uniform float uDisplStrenght1;
            uniform float uDisplStrenght2;

            varying vec2 vUv;

            vec4 gammaCorrect(vec4 color, float gamma){
            return pow(color, vec4(1.0 / gamma));
            }

            vec4 levelRange(vec4 color, float minInput, float maxInput){
            return min(max(color - vec4(minInput), vec4(0.0)) / (vec4(maxInput) - vec4(minInput)), vec4(1.0));
            }

            vec4 levels(vec4 color, float minInput, float gamma, float maxInput){
            return gammaCorrect(levelRange(color, minInput, maxInput), gamma);
            }

            vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
            }

            vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
            }

            vec4 permute(vec4 x) {
                return mod289(((x*34.0)+1.0)*x);
            }

            vec4 taylorInvSqrt(vec4 r)
            {
            return 1.79284291400159 - 0.85373472095314 * r;
            }
            

            float snoise3(vec3 v)
            {
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 =   v - i + dot(i, C.xxx) ;

            // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            //   x0 = x0 - 0.0 + 0.0 * C.xxx;
            //   x1 = x0 - i1  + 1.0 * C.xxx;
            //   x2 = x0 - i2  + 2.0 * C.xxx;
            //   x3 = x0 - 1.0 + 3.0 * C.xxx;
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
            vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

            // Permutations
            i = mod289(i);
            vec4 p = permute( permute( permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            float n_ = 0.142857142857; // 1.0/7.0
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

            //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                            dot(p2,x2), dot(p3,x3) ) );
            }

            float snoise(vec3 v)
            {
                return snoise3(v);
            }

            float fbm3d(vec3 x, const in int it) {
                float v = 0.0;
                float a = 0.5;
                vec3 shift = vec3(100);

                
                for (int i = 0; i < 32; ++i) {
                    if(i<it) {
                        v += a * snoise(x);
                        x = x * 2.0 + shift;
                        a *= 0.5;
                    }
                }
                return v;
            }

            void main() {
                vec2 newUv = vUv;
                vec4 txtNoise1 = texture2D(uTxtCloudNoise, vec2(vUv.x + uTime * 0.0001, vUv.y - uTime * 0.00014)); // noise txt
                vec4 txtNoise2 = texture2D(uTxtCloudNoise, vec2(vUv.x - uTime * 0.00002, vUv.y + uTime * 0.000017 + 0.2)); // noise txt
                float noiseBig = fbm3d(vec3(vUv * uFac1, uTime * uTimeFactor1), 4)+ 1.0 * 0.5;
                newUv += noiseBig * uDisplStrenght1;
                float noiseSmall = snoise3(vec3(newUv * uFac2, uTime * uTimeFactor2));

                newUv += noiseSmall * uDisplStrenght2;

                vec4 txtShape = texture2D(uTxtShape, newUv);

                float alpha = levels((txtNoise1 + txtNoise2) * 0.6, 0.2, 0.4, 0.7).r;
                alpha *= txtShape.r;

                gl_FragColor = vec4(vec3(#r#,#g#,#b#), alpha);
            }`;


    const animate = () => {
            let delta = clock.getDelta();

            requestAnimationFrame(animate);
            //controls.update();
           
           // lightnings.forEach(element => {
            //    element.update(Date.now);
            //});
            
            //console.log(cam);
            renderer.autoClear = false;
            renderer.clear();
            
            cam.layers.set(1);
            //camera.layers.set(1);
            
            
            renderer.clearDepth();
            cam.layers.set(0);
            renderer.render(scene, cam);
            composer.render();
        },
        
        resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);

        },
        createbuildingparticles = (numberparticles,sized,irows,icolumns,size,r,g,b) => {
            var vertices = [];
            for ( let i = 0; i < numberparticles; i ++ ) {
                var bl = Math.random();
                var x,y,z;    
                if (bl > 0.75)
                {
                    x = icolumns*60 - 25 -Math.ceil(size/2);  
                    y = Math.floor(Math.random()*sized);
                    z = irows*-60 + Math.floor(Math.random()*50) -25;
                }
                else if(bl > 0.5)
                {
                    x = icolumns*60 - 25 -Math.ceil(size/2);  
                    y = Math.floor(Math.random()*sized);
                    z = irows*-60 + Math.floor(Math.random()*50) -25;
                }
                else if(bl > 0.25)
                {
                    x = icolumns*60 + Math.floor(Math.random()*50) -25;  
                    y = Math.floor(Math.random()*sized);
                    z = irows*-60 - 25 - Math.ceil(size/2) ;
                }
                else
                {
                    x = icolumns*60 + Math.floor(Math.random()*50) -25;  
                    y = Math.floor(Math.random()*sized);
                    z = irows*-60 + 25 + Math.ceil(size/2);
                }
                vertices.push( x, y, z );

            }

            var particle = new THREE.BufferGeometry();
            particle.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
                    //var r = Math.floor(Math.random()*50)+105;
                    //var g = Math.floor(Math.random()*50)+105;
                    //var b = Math.floor(Math.random()*50)+205;
            var pmaterial = new THREE.PointsMaterial( { color:'rgb('+r+','+g+','+b+')' ,size:Math.floor(Math.random()*size)+1} );
            var points = new THREE.Points( particle, pmaterial );
            scene.add( points );
        },    
        nextPowerOfTwo = (value) => {
            value --;
            value |= value >> 1;
            value |= value >> 2;
            value |= value >> 4;
            value |= value >> 8;
            value |= value >> 16;
            value ++;
            return value;
        },
        createCloudTexture = (size,r,g,b,a) => {
            var canvas = makeDMCanvas(size,size);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            //var cloudtextureslength = cloudtextures.length;
            return texture;
        },
        createtrackdata = function(params) {
            if(params == undefined)
            { params = {
                min: 40,
                max: 80,
                minSegmentLength: 2,
                maxSegmentLength: 16,
                curviness: .3,  
                maxAngle: 150
                }
            }
            var track = new Object();
            var min = params.min;
            var max = params.max;
            var minSegmentLength = params.minSegmentLength;
            var maxSegmentLength = params.maxSegmentLength;
            var curviness = params.curviness;
            var maxAngle = params.maxAngle / 360 * Math.PI;
            
            track.data = new Array();
            track.points = Math.floor((max-min) * Math.random()) + min;
            
            track.minX = 0;
            track.minY = 0;
            track.maxX = 0;
            track.maxY = 0;
            
            track.data[0] = {x: 250, y: 250};
            direction = 0;
            
            for(i = 1; i < track.points; i++) {
                var len = Math.floor((maxSegmentLength - minSegmentLength) * Math.random())  + minSegmentLength;
                var dx = Math.sin(direction) * len;
                var dy = Math.cos(direction) * len;
                var x = track.data[i-1].x + dx;
                var y = track.data[i-1].y + dy;
                track.data[i] = { x: x, y: y };
                turn = Math.pow(Math.random(), 1 / curviness);
                if(Math.random() < .5) turn = -turn;
                direction += turn * maxAngle;
            }
            
            // In the last quarter of the track, force the points progressively closer to the start.
            q = Math.floor(track.points * .75);
            c = track.points - q;
            var x0 = track.data[0].x;
            var y0 = track.data[0].y;
            
            for(i = q; i < track.points; i++) {
                var x = track.data[i].x;
                var y = track.data[i].y;
                var a = i-q;
                track.data[i].x = x0 * a/c + x * (1 - a/c);
                track.data[i].y = y0 * a/c + y * (1 - a/c);
            }
            
            for(i = 1; i < track.points; i++) {  
                x = track.data[i].x;
                y = track.data[i].y;
                if(x < track.minX) track.minX = x;
                if(y < track.minY) track.minY = y;
                if(x > track.maxX) track.maxX = x;
                if(y > track.maxY) track.maxY = y;
                
                track.minSize = Math.min(track.minX, track.minY);
                track.maxSize = Math.max(track.maxX, track.maxY);
            }
            
            return track;
        },
        createTextureCloud1 =() => {
            //scale = 500 / (track.maxSize - track.minSize);
            //ctx.setTransform(scale, 0, 0, scale, -track.minSize, -track.minSize);
            var track = createtrackdata();
            var canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0,0,500,500);
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#fff';
            ctx.moveTo(track.data[0].x, track.data[0].y);
            for(i = 1; i <= track.points; i++) {
                var p = i % track.points;
                ctx.lineTo(track.data[p].x, track.data[p].y);
            }
            ctx.stroke();
            
            // To draw the actual track, we need to bisect each line segment and use the center as the curve
            // endpoint, then use the original line endpoints as the control points
            ctx.beginPath();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            for(i = 0; i <= track.points; i++) {
                var p1 = i % track.points;
                var p2 = (i+1) % track.points;
                x = (track.data[p1].x + track.data[p2].x) / 2;
                y = (track.data[p1].y + track.data[p2].y) / 2;
                
                if(i == 0) {
                ctx.moveTo(x, y);
                } else {
                ctx.quadraticCurveTo(track.data[p1].x, track.data[p1].y, x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        },
        createCloudMaterial = (size,r,g,b,a) => {
            var t1 = createTextureCloud1();
            var t2 = createCloudTexture(512);            
            var myUniforms = {
                uTime: {value: 0},
                uTxtShape: {value: t1},
                uTxtCloudNoise: {value: t2},
                uFac1: {value: 17.8},
                uFac2: {value: 2.7},
                uTimeFactor1: {value: 0.002},
                uTimeFactor2: {value: 0.0015},
                uDisplStrenght1: {value: 0.04},
                uDisplStrenght2: {value: 0.08},
            }
            var fr = fragment.replace("#r#",r).replace("#g#",g).replace("#b#",b);
            var smat = new THREE.ShaderMaterial({
                uniforms: {...THREE.UniformsUtils.clone(THREE.ShaderLib.sprite.uniforms), ...myUniforms},
                vertexShader: vertex,
                fragmentShader: fr,
                transparent: true,
            });
            smat.uniforms.uTxtShape.value = t1;
            smat.uniforms.uTxtCloudNoise.value = t2;
            return smat;
        },
        createTexture = (sized,blocksize,colors,basecolor,prop,rr,mm) => {
            var canvas = document.createElement("canvas");
            canvas.width = 50*20
            canvas.height = sized*20;
            ctx = canvas.getContext('2d');
            //console.log(pSBC(1,basecolor));
            ctx.strokeStyle = pSBC(0.02,basecolor);
            var i = 0;
            var j = 0; 
            while(i<canvas.height/20) {
                j = 0;
                while(j<canvas.width/20) {
                    if(Math.random()*prop<1)
                    {
                        ctx.fillStyle = colors[Math.ceil(Math.random()*colors.length)];
                        var p = Math.ceil(Math.random()*3);
                    }
                    else
                    {
                        ctx.fillStyle = basecolor;
                        p=1;
                    }
                    if(Math.random()*8<1)
                    {
                        ctx.moveTo(j*20,i*20);
                        ctx.lineTo(j*20,(i+blocksize)*20);
                        ctx.stroke();
                    }
                    
                    ctx.fillRect(j*20*p, i*20, blocksize*20*p, blocksize*20);                                    
                    
                    j=j + blocksize*p;
                }
                ctx.moveTo(0,i*20);
                ctx.lineTo(50*20,i*20);
                ctx.stroke();
                i=i+blocksize;
            }

            
            var texture = new THREE.Texture(canvas);
            textures[sized] = texture;
            textures[sized].needsUpdate = true;
            //Create an array of materials to be used in a cube, one for each side
            var cubeMaterialArray = [];

            //order to add materials: x+,x-,y+,y-,z+,z-
            cubeMaterialArray.push( new THREE.MeshStandardMaterial( { map:textures[sized] ,roughness:rr,metalness:mm} ) );
            cubeMaterialArray.push( new THREE.MeshStandardMaterial( { map:textures[sized] ,roughness:rr,metalness:mm} ) );
            cubeMaterialArray.push( new THREE.MeshStandardMaterial( { color: 0x000000   ,roughness:rr,metalness:mm}) );
            cubeMaterialArray.push( new THREE.MeshStandardMaterial( { color: 0x000000  ,roughness:rr,metalness:mm} ));
            cubeMaterialArray.push( new THREE.MeshStandardMaterial( { map:textures[sized] ,roughness:rr,metalness:mm} ) );
            cubeMaterialArray.push( new THREE.MeshStandardMaterial( { map:textures[sized] ,roughness:rr,metalness:mm} ) );
            
            materials[sized] = new THREE.MeshFaceMaterial( cubeMaterialArray );


        },
        createpark = (irows,icolumns) => {
            var vcolors = [];
            var vertices = [];
            for ( let i = 0; i < 25; i ++ ) {
                for ( let j = 0; j < 25; j ++ ) {
                    if(Math.random()*5<1)
                    {
                        x = icolumns*60 - 25 + i*2;  
                        y = Math.floor(Math.random()*20) + 30;
                        z = irows*-60 -25 + j*2; 
                        vertices.push( x, y, z );
                        var r = Math.floor(Math.random()*155);
                        var g = Math.floor(Math.random()*155);
                        var b = Math.floor(Math.random()*100)+155;
                        var color = new THREE.Color("rgb("+r+","+g+","+b+")");
                        vcolors.push( color.r, color.g, color.b);
                    }
                }
            }

            var particle = new THREE.BufferGeometry();
            particle.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            particle.setAttribute( 'color', new THREE.Float32BufferAttribute( vcolors, 3,true ) );
            var pmaterial = new THREE.PointsMaterial( {vertexColors: true, size:2} );

            var points = new THREE.Points( particle, pmaterial );
            
            scene.add( points );
        },
        city = () => {
            parks = [];
            
            colors = [];
            var i = 0;
            while(i<100){
                var r = Math.floor(Math.random()*255);
                var g = Math.floor(Math.random()*255);
                var b = Math.floor(Math.random()*100)+155;
                colors.push('rgb('+r+','+g+','+b+')');
                i++;
            }
            
            var rows = 100;
            var columns = 100 
            var citysize = 10;
            irows = 0;
            icolumns = 0; 
            var ilight = 0;
            while(irows<rows){
                parks[irows] = [];
                icolumns = 0;
                while(icolumns<columns)
                {
                    var notrendered = true;
                    if(irows > 0 && icolumns > 0)
                    {
                        if(parks[irows][icolumns-1]==undefined && parks[irows-1][icolumns]==undefined)
                        {
                            if(Math.ceil(Math.random()*16)==1)
                            {
                                parks[irows][icolumns] = "park";
                                notrendered = false;
                                createpark(irows,icolumns);
                            } 
                        }
                        else if(parks[irows][icolumns-1]!==undefined || parks[irows-1][icolumns])
                        {
                            if(Math.random()*4<1)
                            {
                                parks[irows][icolumns] = "park";
                                notrendered = false;
                                createpark(irows,icolumns);
                            }
                        }
                    }
                    if (notrendered)
                    {
                        if(Math.ceil(Math.random()*300)==50)
                        {
                            var sized = Math.floor(Math.random()*500) + 30;
                        }
                        /*else if (Math.ceil(Math.random()*50)==25)
                        {
                            var sized = Math.floor(Math.random()*200) + 30;
                        }*/
                        else
                        {
                            var sized = Math.floor(Math.random()*120) + 30;
                        }
                        
                        createbuildingparticles(
                            90,
                            sized,
                            irows,
                            icolumns,
                            1,
                            Math.floor(Math.random()*155),
                            Math.floor(Math.random()*155),
                            Math.floor(Math.random()*100)+155
                        );

                        

                    
                        var geometry = new THREE.BoxGeometry( 50, sized, 50 );
                        if(textures[sized]==undefined)
                        {
                            var r = Math.floor(Math.random()*10);
                            var g = Math.floor(Math.random()*10);
                            var b = Math.floor(Math.random()*20);
                            if(r<10){r='0'+r;}
                            if(g<10){g='0'+g;}
                            if(b<10){b='0'+b;}
                            createTexture(sized,3,colors,"#"+r+g+b,10,0.5,0.5);
                        }
                        // var material = new THREE.MeshStandardMaterial( {map:} );
                        var cube = new THREE.Mesh( geometry, materials[sized] );
                        cube.position.x = 0 + icolumns*60;
                        cube.position.z = 0 - irows*60;
                        cube.position.y = 0+sized/2;
                        if(Math.floor(Math.random()*400)==50)
                        {
                            var r = Math.floor(Math.random()*255);
                            var g = Math.floor(Math.random()*255);
                            var b = Math.floor(Math.random()*100)+155;
                            //var light = new THREE.PointLight( 'rgb('+r+','+g+','+b+')', 200, 1500 );
                            //light.position.set( 0 + icolumns*60 +5 , 100, 0 - irows*60 +5 );
                            //light.castShadow = true; // default false
                            //scene.add( light );
                            ilight = 0;
                        }
                        
                        scene.add( cube );
                    }
                    icolumns++;
                    ilight++;
                }
                irows++;
            }
            //cam.lookAt(cube.position);
            animate();
        },
        plane = () => {
            const geometry = new THREE.PlaneGeometry( 100000, 100000 );
            const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
            gb_plane = new THREE.Mesh( geometry, material );
            //gb_plane.castShadow = true; //default is false
            //gb_plane.receiveShadow = true; //default
            gb_plane.layers.enable(0);
            scene.add( gb_plane );
            gb_plane.rotation.x = Math.PI / 2;
            
            animate();
        },
        lights = () => {
            //const light = new THREE.DirectionalLight(0xffffff, 0.5);
            //const light2 = new THREE.DirectionalLight(0xffffff, 1);
            //const light3 = new THREE.AmbientLight( 0x404040 ); // soft white light
            
            clock = new THREE.Clock();

            renderer = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true
            });
            scene = new THREE.Scene();
           // var fogColor = new THREE.Color(0x000000);
           // scene.background = fogColor;
            //scene.fog = new THREE.Fog(fogColor, 0.0025, 2000);
            camera();
            renderScene = new RenderPass( scene, cam )
	
            effectFXAA = new ShaderPass( FXAAShader )
            effectFXAA.uniforms.resolution.value.set( 1 / w, 1 / h )
                
            bloomPass = new UnrealBloomPass( new THREE.Vector2( 512, 512 ))
            bloomPass.threshold = 0
            bloomPass.strength = 3.5
            bloomPass.radius = 0.25
            bloomPass.renderToScreen = true
                
            composer = new EffectComposer( renderer )
            composer.setSize( w, h )
                
            composer.addPass( renderScene )
            composer.addPass( effectFXAA )
            composer.addPass( bloomPass )
                
            renderer.gammaInput = true
            renderer.gammaOutput = true
            renderer.toneMappingExposure = Math.pow( 0.9, 4.0 ) 


            renderer.setClearColor(0x000000, 1);
            renderer.setSize(w, h);
            renderer.gammaInput = true;
            renderer.gammaOutput = true;
            renderer.shadowMap.renderSingleSided = true;
            renderer.shadowMap.enabled = true;
			//renderer.shadowMap.type = THREE.PCFShadowMap;
            renderer.physicallyCorrectLights = true;
          
            //var light = new THREE.PointLight( 0xffd722, 5000, 1000000 );
            //light.position.set( 500 , 1000, 100 );
            //light.castShadow = true; // default false
            //scene.add( light );
                        //var light = new THREE.DirectionalLight(0x, 1);
            //light2 = new THREE.PointLight(0xffffff, 1, 0)
            //light2.position.y = 100;
            //light2.position.x = 10;
            //light2.position.x = 0;
            //light2.castShadow = true;
            
            //scene.add(light);
            //scene.add(light2);
            //light.position.set(-1, 0, 1);
            //light2.position.set(100,100,100);
            //scene.add(light2);
            //scene.add(light);
            //scene.add( light3 );
        },
        camera = () => {
            cam = new THREE.PerspectiveCamera(
                75,
                w / h,
                1,
                10000
            );
            //cam.position.x = 650;
            //cam.position.y = 400;
            //cam.position.z = -500;
            
           
            //cam.rotation.x = 0.5816488609588804; 
            //cam.rotation.y = 0.667426560640619;
            //cam.rotation.z = 0.3865157738822695;
            //x: 653.3549360925806, y: 392.89175589216507, z: -500.5114293184887
            //_x: , _y: , _z: 
           // cam.lookAt( scene.position )
            
            scene.add(cam);
            var light = new THREE.PointLight( 0x7753ff, 400, 10000 );
            light.position.set( 111, 400, -423 );
            light.castShadow = true; // default false
            scene.add( light );
            
            //controls.update() must be called after any manual changes to the camera's transform
            //controls.update();
            cam.rotation.set(-0.1585869487498817, -0.8, -0.084279899168488);
            cam.position.set(111, 400, -423);
        },
        fog = () => {
            fogColor = new THREE.Color(0xffffff); 
            scene.background = fogColor;
            scene.fog = new THREE.Fog(fogColor, 0.0025, 20);
        },
        smoke = () => {
            //smokeMaterial.color.set('rgb('+r+','+g+','+b+')');
            smokeMaterial = createCloudMaterial(500,0,0,0,1);
            var i = 0;
            
            while(i<100)
            {
                var r = Math.floor(Math.random()*5+5);
                var g = Math.floor(Math.random()*5+5);
                var b = Math.floor(Math.random()*5+5);
                if (r<=9){r="0"+r}
                if (g<=9){g="0"+r}
                if (b<=9){b="0"+r}    
                smokeMaterial[i] = createCloudMaterial(500,"0.0"+r,"0.0"+r,"0.0"+r,1);
                i++;
            }
            console.log(smokeMaterial);
            for (let p = 0, l = 30000; p < l; p++) {
                var size = 512
                /*if(cloudtextures[size]==undefined)
                {
                    var r = Math.floor(Math.random()*55);
                    var g = Math.floor(Math.random()*55);
                    var b = Math.floor(Math.random()*55);
                    createCloudTexture(size,r,g,b,255);
                }*/
                var smokeGeo = new THREE.PlaneBufferGeometry(size, size);    
                //let particle = new THREE.Sprite( smokeMaterial );
                let particle = new THREE.Mesh(smokeGeo, smokeMaterial[Math.floor(Math.random()*100)]);
                //particle.scale.set(size, size, 1)
                particle.position.set(
                    -6000+Math.floor(Math.random() * 12000),
                    1000+Math.floor(Math.random()*100),
                    6000-1*Math.floor(Math.random() * 12000)
                );
                scene.add(particle);
                //smokeParticles.push(particle);
            }
            animate(); 
        },
        makelightning = (material,height,x,y,z,end,faktor,first,colorrgb) => {
            
            while(y > end)
            {
                var points = [];
                points.push( new THREE.Vector3(  x, y, z  ) );
                x = x+Math.floor(Math.random()*(10+faktor)-(5+faktor/2));
                z = z-Math.floor(Math.random()*(10+faktor)-(5+faktor/2));
                if(faktor > 0)
                {
                    y = y - 10*(Math.random()+0.5); 
                }
                else
                {
                    y = y - 10;
                }
                
                points.push( new THREE.Vector3( x, y, z ) );
                var geometry = new THREE.BufferGeometry().setFromPoints( points );
                var line = new THREE.Line( geometry, material );
                line.layers.enable(1);
                scene.add( line );
                if(Math.floor(Math.random()*200) == 10)
                {
                    faktor = faktor + 20;
                    makelightning(material,0,x,y,z,end+y*Math.random(),faktor,false)
                }
            }
            if(y<=end)
            {
                if(first)
                {
                    var light = new THREE.PointLight( colorrgb, 200, 2500 );
                    light.position.set( x , 300, z );
                    //light.castShadow = true; // default false
                    scene.add( light );
                }
                
            }
            return;
            
        },
        line = () => {

            
            var i = 0;
            
            while(i<3)
            {
                var r = Math.floor(Math.random()*100)+155;
                var g = Math.floor(Math.random()*100)+155;
                var b = 255;
                colorrgb = 'rgb('+r+','+g+','+b+')';
                var material = new THREE.LineBasicMaterial({
                    color: colorrgb,
                    linewidth: 5,
                });
                
                var x = Math.floor(Math.random()*5000)+1000;
                var z = Math.floor(-4000*Math.random())-2000;

               
                makelightning(material,2500,x,4500,z,0,0,true,colorrgb);
                i++;

            }

            
        },
        lightning = () => {
            line();
            for ( let i = 0; i < 10; i ++ ) {
                var r = Math.floor(Math.random()*155)+100;
                var g = Math.floor(Math.random()*155)+100;
                var b = Math.floor(Math.random()*55)+200;
                var colorrgb = 'rgb('+r+','+g+','+b+')';
                const material = new THREE.MeshBasicMaterial({
                    color: colorrgb, side:'both'
                });
                //var material = createGlowMaterial(0.5,0x0000ff,1);
                var toldtz = 0;
                var steigung = 0;
                var randomzpos = Math.random()*-6000;
                var randomxpos = Math.random()*6000;
                var steigungz = 0;
                var xrand = Math.random()*50-50;
                if(xrand > -20 &&  xrand < 20)
                {
                    if (xrand>0)
                    {
                        xrand += 30;
                    }
                    else
                    {
                        xrand -= 30;
                    }
                }
                var zrand = Math.random()*50-50;

                if(zrand > -20 &&  zrand < 20)
                {
                    if (zrand>0)
                    {
                        zrand += 30;
                    }
                    else
                    {
                        zrand -= 30;
                    }
                }

                class CustomSinCurve extends THREE.Curve {

                    constructor( scale = 1 ) {

                        super();

                        this.scale = scale;

                    }
                    
                    getPoint( t, optionalTarget = new THREE.Vector3() ) {

                        const tx = t * 200 - 1.5;
                        var ty = 0;
                        if (steigung == 0)
                        {
                            steigung = Math.sin( 20* Math.PI * t );
                        }
                        else
                        {
                            steigung = (steigung*10 + (((Math.random())*80)+xrand*20))/20; 
                            
                        }
                        toldtz = ty;
                            var tz = 0;
                        if (steigungz == 0)
                        {
                            steigungz = Math.sin( 20 * Math.PI * t );
                        }
                        else
                        {
                            steigungz = (steigungz*10 + (((Math.random())*80)+zrand*20))/20; 
                            
                        }
                        ty =  steigung ;
                        tz =  steigungz ;
                            return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

                        }

                    }

                const path = new CustomSinCurve( 10 );
                const geometry = new THREE.TubeGeometry( path, 70, 10, 50, false );
                const line = new THREE.Mesh( geometry, material );
                line.rotation.z = Math.PI / 2 + (Math.random()-1) * 0.2;
                line.position.x = line.position.x + randomxpos;
                line.position.z = line.position.z + randomzpos; 
                line.layers.enable(1);
                scene.add( line );
               
                

            }
        },
        makeDMCanvas = (w, h) => {
            var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            i,
            l;

            canvas.width = w;
            canvas.height = h;
            // Only previously touched pixels are modifiable when writing imageData
            context.fillRect(0, 0, w, h);

            var imageData = context.getImageData(0, 0, w, h),
            pixels = imageData.data;

            diamondSquare(pixels, w, h);

            context.putImageData(imageData, 0, 0);
            return canvas;
        },
        diamondSquare = (pixels, w, h) => {
            // Set the segment length to the smallest power of 2 that is greater than
            // the number of vertices in either dimension of the plane
            var segments = nextPowerOfTwo(Math.max(w, h) + 1);

            // Initialize heightmap
            var size = segments + 1,
                heightmap = [],
                smoothing = 256, // max height - min height
                i,
                j,
                xl = w + 1,
                yl = h + 1;
            for (i = 0; i <= segments; i++) {
                heightmap[i] = new Float64Array(segments+1);
            }

            // Generate heightmap
            for (var l = segments; l >= 2; l /= 2) {
                var half = Math.round(l*0.5),
                    whole = Math.round(l),
                    x,
                    y,
                    avg,
                    d,
                    e;
                smoothing /= 2;
                // square
                for (x = 0; x < segments; x += whole) {
                    for (y = 0; y < segments; y += whole) {
                        d = Math.random() * smoothing * 2 - smoothing;
                        avg = heightmap[x][y] +            // top left
                            heightmap[x+whole][y] +      // top right
                            heightmap[x][y+whole] +      // bottom left
                            heightmap[x+whole][y+whole]; // bottom right
                        avg *= 0.25;
                        heightmap[x+half][y+half] = avg + d;
                    }
                }
                // diamond
                for (x = 0; x < segments; x += half) {
                    for (y = (x+half) % l; y < segments; y += l) {
                        d = Math.random() * smoothing * 2 - smoothing;
                        avg = heightmap[(x-half+size)%size][y] + // middle left
                            heightmap[(x+half)%size][y] +      // middle right
                            heightmap[x][(y+half)%size] +      // middle top
                            heightmap[x][(y-half+size)%size];  // middle bottom
                        avg *= 0.25;
                        avg += d;
                        heightmap[x][y] = avg;
                        // top and right edges
                        if (x === 0) heightmap[segments][y] = avg;
                        if (y === 0) heightmap[x][segments] = avg;
                    }
                }
            }

            // Apply heightmap
            for (i = 0; i < w; i++) {
                for (j = 0; j < h; j++) {
                    var index = (j * w + i) * 4,
                        value = heightmap[i][j] + 128;
                    pixels[index + 0] = value;
                    pixels[index + 1] = value;
                    pixels[index + 2] = value;
                }
            }
        },
        setcontrols = () => {
            controls = new OrbitControls( cam, renderer.domElement );
            controls.keys= {
                LEFT: 'ArrowLeft', //left arrow
                UP: 'ArrowUp', // up arrow
                RIGHT: 'ArrowRight', // right arrow
                BOTTOM: 'ArrowDown' // down arrow
            }
            controls.enablePan = true;
            controls.enableKeys = true;
            controls.enableZoom = true;
            controls.listenToKeyEvents();
        },
        init = () => {
            h = 2010;
            w = 6400;
            
            lights(); //💡
            //camera(); // 🎥
            //setcontrols();
            plane();
            //smoke(); // 🎬
            city();
            line();
            //lightning();
            
            animate();

            document.body.appendChild(renderer.domElement);
            window.addEventListener('resize', resize);
        };

    init();
