// Nah we don't need precision
precision lowp int;
precision lowp float;

// A recreation of the extra little shoreline scene from stage 2 of 
// Gimmick! (Or in PAL regions, Mr. Gimmick).
//     
// Original game by Sunsoft: https://en.wikipedia.org/wiki/Gimmick!
// 
// Original graphics design: Hiroyuki Kagoya
// Shader image: Gerard Geer (https://github.com/gerard-geer)
// Music composition: Masashi Kageyama
// Shader sound: Michael Moffitt (https://github.com/mikejmoffitt)
// This shader on github: https://github.com/gerard-geer/GimmickShader/

// A 2,4,8,16, or 32 element array implemented as a binary search, #defined for type agnosticity.
#define ARR2(x, a,b) (x<1) ? a : b
#define ARR4(x, a,b,c,d) (x<2) ? ARR2(x,a,b) : ARR2(x-2,c,d)
#define ARR8(x, a,b,c,d, e,f,g,h) (x<4) ? ARR4(x, a,b,c,d) : ARR4(x-4, e,f,g,h)
#define ARR16(x, a,b,c,d, e,f,g,h, i,j,k,l, m,n,o,p) (x<8) ? ARR8(x, a,b,c,d, e,f,g,h) : ARR8(x-8, i,j,k,l, m,n,o,p)
#define ARR32(x_, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p, q,r,s,t,u,v,w,x,y,z,aa,ab,ac,ad,ae,af) (x_<16) ? ARR16(x_, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p) : ARR16(x_-16,q,r,s,t,u,v,w,x,y,z,aa,ab,ac,ad,ae,af)

// Constant color vectors so palette functions don't continually have to initialize new stuff.
const vec4 D_BLUE  = vec4(.235, .737, .988, 1.00);
const vec4 L_BLUE  = vec4(.659, .894, .988, 1.00);
const vec4 WHITE   = vec4(.988, .988, .988, 1.00);
const vec4 BLACK   = vec4(.000, .000, .000, 1.00);
const vec4 GRAY    = vec4(.455, .455, .455, 1.00);
const vec4 GRASS   = vec4(.502, .816, .063, 1.00);
const vec4 D_GREEN = vec4(.000, .235, .078, 1.00);
const vec4 L_GREEN = vec4(.298, .863, .282, 1.00);
const vec4 D_GOLD  = vec4(.486, .031, .000, 1.00);
const vec4 L_GOLD  = vec4(.988, .596, .219, 1.00);
const vec4 TRANS   = vec4(.000, .000, .000, .000);

// Define out stuff so we don't have to pass the values as parameters.
#define YUMETAROU_X 52
#define YUMETAROU_Y 117
#define SHORE_Y 136
#define SHORE_END 79
#define CLOUD_Y 128
#define WAVES_Y 168
#define BIRD_A_Y 20
#define BIRD_B_Y 32
#define BIRD_C_Y 45
#define BIRD_D_Y 53
#define BIRD_E_Y 62
#define BIRD_F_Y 69
#define BIRD_G_Y 72

// The big cloud takes a lot of orchestration. These are the coordinates
// of the individual tiles.
// The cloud tiles represent only the detailed upper portions of it.
// Anything below them is drawn in as white.
#define CLOUD_A_X 97
#define CLOUD_A_Y 160
#define CLOUD_B_X 105
#define CLOUD_B_Y 152
#define CLOUD_C_X 113
#define CLOUD_C_Y 152
#define CLOUD_D_X 129
#define CLOUD_D_Y 144
#define CLOUD_E_X 137
#define CLOUD_E_Y 136
#define CLOUD_F_X 145
#define CLOUD_F_Y 128
#define CLOUD_G_X 161
#define CLOUD_G_Y 128
#define CLOUD_H_X 169
#define CLOUD_H_Y 128
#define CLOUD_I_X 177
#define CLOUD_I_Y 136
#define CLOUD_J_X 185
#define CLOUD_J_Y 144
#define CLOUD_K_X 193
#define CLOUD_K_Y 152
#define CLOUD_L_X 201
#define CLOUD_L_Y 152
#define CLOUD_M_X 217
#define CLOUD_M_Y 152
#define CLOUD_N_X 225
#define CLOUD_N_Y 152

// The positioning of the smaller cloud.
#define S_CLOUD_A_X 184
#define S_CLOUD_A_Y 115
#define S_CLOUD_B_X 192
#define S_CLOUD_B_Y 112
#define S_CLOUD_C_X 216
#define S_CLOUD_C_Y 115
    
/*
*	Yumetarou's palette.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 yumetarouPalette(in int c)
{
    if(c < 4)
    {
        return ARR4(c,  WHITE,  	// The slightly not white white.
                        L_GREEN,	// Light green.
                        D_GREEN,	// Dark green.
                        L_GOLD); 	// Light gold.
    }
    else
    {
        c-=4;
        return ARR2(c, 	D_GOLD, 	// Dark gold.
                		TRANS);  	// Transparency.
    }
}

/*
*	Yumetarou's eyes-open sprite frame.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int yumetarouEyesOpen(in int x, in int y)
{
    if(y<16)
    {
        return ARR16(y,  ARR16(x,5,5,5,5,4,4,5,5,5,5,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,4,3,4,5,5,5,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,4,3,3,4,5,5,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,2,2,2,2,2,2,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,2,2,1,1,1,1,2,2,5,5,5,5),
                         ARR16(x,5,5,5,2,1,1,1,1,1,1,1,1,2,5,5,5),
                         ARR16(x,5,5,2,1,1,1,1,1,1,1,1,1,2,5,5,5),
                         ARR16(x,5,5,2,1,1,1,0,0,0,1,1,0,0,2,5,5),
                         ARR16(x,5,2,1,1,1,0,0,2,2,2,0,0,2,2,5,5),
                         ARR16(x,5,2,1,1,1,0,0,0,2,2,0,0,0,2,5,5),
                         ARR16(x,2,1,1,1,1,0,0,2,2,2,0,0,2,2,2,5),
                         ARR16(x,2,1,1,1,1,1,0,0,0,1,1,0,0,1,2,5),
                         ARR16(x,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2),
                         ARR16(x,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2),
                         ARR16(x,5,2,2,1,1,1,1,1,1,2,2,2,1,1,1,2),
                         ARR16(x,5,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2));
    } 
    if(y==16) return 	 ARR16(x,5,2,1,1,1,1,1,1,1,1,1,1,1,1,2,5);
    if(y==17) return 	 ARR16(x,5,5,2,2,1,1,1,1,1,1,1,1,1,2,2,5);
    if(y==18) return 	 ARR16(x,1,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0);
   	return 5;
}

/*
*	Yumetarou's eyes-closed sprite frame.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int yumetarouEyesClosed(in int x, in int y)
{
    if(y<16){
        return ARR16(y,  ARR16(x,5,5,5,5,4,4,5,5,5,5,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,4,3,4,5,5,5,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,4,3,3,4,5,5,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,2,2,2,2,2,2,5,5,5,5,5,5),
                         ARR16(x,5,5,5,5,2,2,1,1,1,1,2,2,5,5,5,5),
                         ARR16(x,5,5,5,2,1,1,1,1,1,1,1,1,2,5,5,5),
                         ARR16(x,5,5,2,1,1,1,1,1,1,1,1,1,2,5,5,5),
						 ARR16(x,5,5,2,1,1,1,0,0,0,1,1,0,0,2,5,5),
						 ARR16(x,5,2,1,1,1,0,0,0,0,0,0,0,0,0,5,5),
						 ARR16(x,5,2,1,1,1,0,2,2,2,2,0,2,2,2,5,5),
						 ARR16(x,2,1,1,1,1,0,0,0,0,0,0,0,0,0,2,5),
						 ARR16(x,2,1,1,1,1,1,0,0,0,1,1,0,0,1,2,5),
                         ARR16(x,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2),
                         ARR16(x,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2),
                         ARR16(x,5,2,2,1,1,1,1,1,1,2,2,2,1,1,1,2),
                         ARR16(x,5,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2));
    } 
    if(y==16) return 	 ARR16(x,5,2,1,1,1,1,1,1,1,1,1,1,1,1,2,5);
    if(y==17) return 	 ARR16(x,5,5,2,2,1,1,1,1,1,1,1,1,1,2,2,5);
    if(y==18) return 	 ARR16(x,1,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0);
   	return 5; // Transparency.
}

/*
*	Yumetarou's draw function.
*   
*	Draws Yumetarou to the screen.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of Yumetarou from under the current texel.
*/
vec4 drawYumetarou(in int x, in int y)
{
    if(x < YUMETAROU_X || x > YUMETAROU_X + 15) return vec4(0.0);
    if(y < YUMETAROU_Y || y > YUMETAROU_Y + 18) return vec4(0.0);
    x -= YUMETAROU_X;
    y -= YUMETAROU_Y;
    
    // Yummy yummy frame counting.
    float t = mod(iGlobalTime, 3.67);
    if( t < .066 || (t > .533 && t <.600) )
        return yumetarouPalette(yumetarouEyesClosed(x,y));
    else
        return yumetarouPalette(yumetarouEyesOpen(x,y));
}

/*
*	The birds' palette.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 birdPalette(in int c)
{
    return ARR4(c,  WHITE,  // The slightly not white white.
                	GRAY,  	// Gray
                	BLACK,  // Black
                    TRANS); // Transparency.
}

/*
*	A bird's wing-level tile frame.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int birdWingsLevel(in int x,in int y)
{
    if(y<4){
		return ARR4(y,	 3,
						 ARR8(x,3,0,0,0,1,0,0,3),
						 ARR8(x,2,3,3,0,0,3,3,2),
						 ARR8(x,3,3,3,1,0,3,3,3));
    }
    else return 3;
}

/*
*	The frame of the bird with its wings up.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int birdWingsUp(in int x,in int y)
{
    if(y<4){
		return ARR4(y,	 ARR8(x,3,2,0,3,3,3,2,3),
						 ARR8(x,3,3,0,0,3,0,3,3),
						 ARR8(x,3,3,1,0,1,0,3,3),
						 ARR8(x,3,3,3,0,0,3,3,3));
    }
    if(y==4) return		 ARR8(x,3,3,3,1,0,3,3,3);
    else return 3;
}

/*
*	The frame of the bird with its wings down.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int birdWingsDown(in int x,in int y)
{
    if(y<4){
		return ARR4(y,	 ARR8(x,3,3,3,0,1,3,3,3),
						 ARR8(x,3,3,3,0,0,0,3,3),
						 ARR8(x,3,3,0,1,0,1,3,3),
						 ARR8(x,3,3,0,3,3,3,0,3));
    }
    if(y==4) return		 ARR8(x,3,3,2,3,3,3,2,3);
    else return 3;
}

/*
*	The bird draw function.
*   
*	Draws a single bird to the screen.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*	atx: The x position at which to draw the bird.
*	aty: The y position at which to draw the bird.
*	flip: Whether or not to flip the bird. (along the x axis.)
*
*	Returns: The color of the bird from under the current texel.
*/
vec4 drawBird(in int x, in int y, in int atx, in int aty, bool flip)
{
    if(x < atx || x > atx + 7) return vec4(0.0);
    if(y < aty || y > aty + 4) return vec4(0.0);
    x -= atx;
    y -= aty;
    
    // Flip the bird if necessary.
    if(flip) x = 7-x;
    
    // This animation is less framecounting and more dividing an amount
    // of time by four.
    float t = mod(iGlobalTime, .533);
    if(t < .133)	return birdPalette(birdWingsLevel(x,y));
    if(t < .266)	return birdPalette(birdWingsUp(x,y));
    if(t < .400)	return birdPalette(birdWingsLevel(x,y));
    return birdPalette(birdWingsDown(x,y));
}



/*
*	The birds' animation function.
*   
*	Returns a modulated value by adding a triangle wave to the
*	starting value s.
*		
*	s: The starting position.
*	t: The current time within the function.
*	f: The frequency of the triangle wave.	
*	a: The amplitude of the triangle wave.
*	d: The boolean first derivative of the triangle function.
*
*	Returns: The modulated position.
*/
int anim(in int s, in float t, in float f, in float a, out bool d)
{
    // Triangle wave = |saw wave|
    float tri = abs( (mod(t*f, 1.0)*2.0)-1.0 );
    // Oh hey triangle waves are kind of sinosodal, let's rotate
    // it by PI/2 for d1
    float d1 = abs( (mod((t+1.0)*f, 1.0)*2.0)-1.0 );
    // Let's go ahead and transform this to (-1..1)
    d1 = (d1*2.0)-1.0;
    // Set the direction to the sign of the derivative.
    d = d1<0.0;
    // Finally we return the animated position.
	return s + int(tri*a);
}

/*
*	The whole flock's draw function.
*
*	Draws all the birds to the screen, animated.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*	
*	Returns: The color of the birds from under the current fragment.
*/
vec4 drawBirds(in int x, in int y)
{
    // Since birds never cross we can use additive blending.
    // And as we've learned from the sound let's divvy up addition.
    vec4 result = vec4(0.0);
    bool f;
    int a = anim(120,iGlobalTime+16.0,0.2,50.0,f);
    result += drawBird(x,y,a,BIRD_A_Y,f);
    a = anim(152,iGlobalTime+14.0,0.2,30.0,f);
    result += drawBird(x,y,a,BIRD_B_Y,f);
    a = anim(110,iGlobalTime+12.0,0.2,40.0,f);
    result += drawBird(x,y,a,BIRD_C_Y,f);
    a = anim(208,iGlobalTime+10.0,0.2,20.0,f);
    result += drawBird(x,y,a,BIRD_D_Y,f);
    a = anim(164,iGlobalTime+8.0, 0.2,50.0,f);
    result += drawBird(x,y,a,BIRD_E_Y,f);
    a = anim(100,iGlobalTime+6.0, 0.2,60.0,f);
    result += drawBird(x,y,a,BIRD_F_Y,f);
    a = anim(185,iGlobalTime+4.0, 0.2,50.0,f);
    result += drawBird(x,y,a,BIRD_G_Y,f);
    return result;
    
}

/*
*	The rocky shoreline's palette.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 shorePalette(in int x)
{
    return ARR4(x, WHITE,
                   GRASS,
                   GRAY,
                   BLACK);
}

/*
*	The repeated interior portion of the shore.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int shoreInterior(in int x, in int y)
{
    x = int(mod(float(x),32.0));
    return ARR32(y, 
             3,
			 0,
			 1,
			 1,
			 1,
			 1,
			 1,
			 1,
			 ARR32(x,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),
			 ARR32(x,1,1,1,1,1,2,2,2,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1),
			 ARR32(x,1,1,1,1,1,2,2,3,2,1,2,3,3,2,2,1,1,1,1,1,1,1,2,2,3,3,3,2,1,1,1,1),
			 ARR32(x,1,1,1,1,2,2,3,3,3,3,3,3,3,3,2,1,1,1,1,1,1,2,2,3,2,2,2,2,2,1,1,1),
			 ARR32(x,1,1,1,1,2,2,3,3,2,0,0,0,0,2,2,1,1,1,1,1,2,2,2,0,0,0,0,0,2,2,1,1),
			 ARR32(x,1,1,2,2,2,2,3,0,0,0,0,0,0,0,2,2,1,1,1,2,2,0,0,0,0,0,0,0,0,2,2,1),
			 ARR32(x,2,2,2,2,2,3,0,0,0,0,0,0,0,0,2,3,2,2,2,2,0,0,0,0,0,0,0,0,0,2,3,2),
			 ARR32(x,2,2,2,2,3,3,0,0,0,0,0,0,0,0,2,2,3,2,2,0,0,0,0,0,0,0,0,0,0,2,3,2),
			 ARR32(x,2,2,2,3,3,2,0,0,0,0,0,0,0,0,2,2,3,2,0,0,0,0,0,0,0,0,0,0,0,2,3,3),
			 ARR32(x,3,3,3,3,3,2,0,0,0,0,0,0,0,2,2,2,3,2,0,0,0,0,0,0,0,0,0,0,0,2,3,3),
			 ARR32(x,2,2,2,3,3,2,0,0,0,0,0,0,2,2,2,3,3,2,0,0,0,0,0,0,0,0,0,0,2,2,3,3),
			 ARR32(x,0,0,0,0,2,2,2,0,0,0,0,2,2,2,3,3,3,2,2,0,0,0,0,0,0,0,0,2,2,2,3,2),
			 ARR32(x,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,2,2,0,0,0,0,0,0,2,2,2,3,2,0),
			 ARR32(x,0,0,0,0,0,0,2,3,3,2,2,2,2,2,0,0,0,0,0,2,3,2,2,2,2,2,2,2,2,3,0,0),
			 ARR32(x,0,0,0,0,0,0,0,2,3,3,3,3,2,0,0,0,0,0,0,0,2,3,2,2,2,2,2,2,3,2,0,0),
			 ARR32(x,0,0,0,0,0,0,0,0,2,3,3,2,0,0,0,0,0,0,0,0,2,3,3,2,2,2,3,3,3,2,0,0),
			 ARR32(x,0,0,0,0,0,0,0,0,2,3,2,0,0,0,0,0,0,0,0,0,2,3,0,0,0,0,2,3,3,2,0,0),
			 ARR32(x,0,0,0,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,3,2,0,0),
			 ARR32(x,0,0,0,0,0,0,0,2,2,3,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,3,0,0),
			 ARR32(x,0,0,0,0,0,0,2,2,3,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,3,2,0),
			 ARR32(x,0,0,0,0,0,2,2,2,3,2,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,2,3,2,2),
			 ARR32(x,2,0,0,0,2,2,2,2,3,2,0,0,0,0,0,0,0,2,3,3,2,0,0,0,0,0,0,0,2,3,2,2),
			 ARR32(x,2,2,2,2,2,2,2,3,3,2,2,0,0,0,0,0,2,3,2,2,2,2,0,0,0,0,0,0,2,3,2,2),
			 ARR32(x,2,2,2,2,2,2,3,3,3,2,2,2,2,2,2,2,2,0,0,0,0,0,2,0,0,0,0,2,2,3,3,2));
}

/*
*	The non-repeated exterior portion of the shore.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int shoreExterior(in int x, in int y)
{
    return ARR32(y,
            ARR16(x,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2),
            ARR16(x,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3),
            ARR16(x,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3),
            ARR16(x,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3),
            ARR16(x,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3),
            ARR16(x,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3),
            ARR16(x,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,3),
            ARR16(x,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,3),
            ARR16(x,1,1,1,1,1,1,2,2,1,1,1,1,2,2,2,3),
            ARR16(x,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,2),
            ARR16(x,1,1,1,1,1,2,2,3,2,2,2,2,3,3,3,2),
            ARR16(x,1,1,1,1,2,2,3,3,3,3,2,2,2,3,3,2),
            ARR16(x,1,1,1,1,2,2,3,3,0,0,0,0,0,2,3,2),
            ARR16(x,1,1,2,2,2,2,3,0,0,0,0,0,0,0,2,3),
            ARR16(x,2,2,2,2,2,3,0,0,0,0,0,0,0,0,2,3),
            ARR16(x,2,2,2,2,3,3,0,0,0,0,0,0,0,0,2,3),
            ARR16(x,2,2,2,3,3,2,0,0,0,0,0,0,0,0,2,3),
            ARR16(x,3,3,3,3,3,2,0,0,0,0,0,0,0,0,2,3),
            ARR16(x,2,2,2,3,3,2,0,0,0,0,0,0,0,2,2,3),
            ARR16(x,0,0,0,0,2,2,2,0,0,0,0,0,2,2,3,2),
            ARR16(x,0,0,0,0,0,2,2,2,0,0,0,2,2,3,3,2),
            ARR16(x,0,0,0,0,0,0,2,3,2,2,2,2,0,0,3,2),
            ARR16(x,0,0,0,0,0,0,0,2,3,3,2,0,0,0,2,3),
            ARR16(x,0,0,0,0,0,0,0,0,3,2,0,0,0,0,2,3),
            ARR16(x,0,0,0,0,0,0,0,0,3,0,0,0,0,0,2,3),
            ARR16(x,0,0,0,0,0,0,0,0,2,0,0,0,0,0,2,3),
            ARR16(x,0,0,0,0,0,0,0,2,2,0,0,0,0,0,2,3),
            ARR16(x,0,0,0,0,0,0,2,2,2,0,0,0,0,0,2,3),
            ARR16(x,0,0,0,0,0,2,2,2,3,0,0,0,0,0,2,3),
            ARR16(x,2,0,0,0,2,2,2,2,3,0,0,0,0,2,3,3),
            ARR16(x,2,2,2,2,2,2,2,3,3,0,0,0,2,2,2,3),
            ARR16(x,2,2,2,2,2,2,3,3,3,2,2,2,0,0,2,3));
}

/*
*	The shoreline's draw function.
*
*	Draws the two interior segments of the shore, then the endcap.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*	
*	Returns: The color of the shore from under the current fragment.
*/
vec4 drawShore(in int x, in int y)
{
    if(x > SHORE_END) return vec4(0.0);
    if(y < SHORE_Y || y > SHORE_Y + 31) return vec4(0.0);
    
    y -= SHORE_Y;
    
    if(x < 64) return shorePalette(shoreInterior(x,y));
    x -= 64;
    return shorePalette(shoreExterior(x,y));
}

/*
*	The palette of those distant clouds.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 farCloudsPalette(in int x)
{
    return ARR2(x, TRANS,
                   L_BLUE);
}

/*
*	The tile function of those clouds in the distance.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int farClouds(in int x, in int y)
{
    x = int(mod(float(x),32.0));
    if(y < 4)
    {
        return ARR4(y, 
        ARR32(x,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0),
        ARR32(x,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0),
        ARR32(x,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0),
        ARR32(x,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0));
    }
    return ARR32(x,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1);
}

/*
*	The non-repeated exterior portion of the shore.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
vec4 drawFarClouds(in int x, in int y)
{
    if(y < SHORE_Y) return TRANS;
    if(y > SHORE_Y + 4) return L_BLUE;
    return farCloudsPalette(farClouds(x,y-SHORE_Y));
    return vec4(0.0);
}

/*
*	The palette of the waves when under the shoreline.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 wavesShadowPalette(in int x)
{
    if(x<4)
    {
        return ARR4(x,  D_BLUE,
			   			D_BLUE,
			   			L_BLUE,
			   			L_BLUE);
    }
    else return WHITE;
}

/*
*	The palette of the waves in the sun.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 wavesSunnyPalette(in int x)
{
    if(x<4)
    {
        return ARR4(x, L_BLUE,
					   WHITE,
					   L_BLUE,
					   WHITE);
    }
    else return WHITE;
}

/*
*	One frame of the waves.
*	Note: The palette of the sunny and shadowed waves are
*	consolidated into a single map with a larger palette.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int wavesA(in int x, in int y)
{
    if(x < 32) // ARR64 would be a really long line.
    {
        return ARR8(y,
       	ARR32(x,4,4,4,4,4,4,4,4,4,3,3,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,4,4,4),
		ARR32(x,4,4,4,2,2,0,0,0,0,2,3,3,3,3,3,3,4,4,4,4,4,3,3,2,2,2,0,0,0,0,0,0),
		ARR32(x,4,2,0,0,0,0,0,0,0,0,0,0,2,4,4,4,4,2,0,0,0,0,3,3,3,3,3,3,2,2,2,2),
		ARR32(x,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3),
		ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3),
		ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0),
		2,
        2);
    }
    else
    {
        x -= 32;
        return ARR8(y,
		ARR32(x,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,4,4,4,0,0,0,0,0,0,0,0,0,4,4,4),
        ARR32(x,0,0,0,0,2,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4),
        ARR32(x,2,2,3,4,4,4,2,2,2,3,0,0,0,0,0,0,0,0,3,3,4,4,4,4,4,4,4,4,2,4,4,4),
        ARR32(x,4,4,4,2,0,0,0,0,0,0,0,0,0,0,3,3,3,4,4,4,4,4,4,2,2,2,4,4,4,4,2,0),
        ARR32(x,3,3,3,3,3,3,2,0,0,0,0,3,3,4,4,4,4,4,4,4,2,2,2,4,4,4,4,2,0,0,0,2),
        ARR32(x,0,0,0,0,0,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2),
        2,
        2);
    }
}

/*
*	Another frame of the waves.
*	Note: The palette of the sunny and shadowed waves are
*	consolidated into a single map with a larger palette.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int wavesB(in int x, in int y)
{
    if(x < 32) // ARR64 would be a really long line.
    {
        return ARR8(y,
		ARR32(x,2,2,2,2,2,0,0,0,0,0,0,0,0,2,2,4,4,4,4,4,4,4,4,4,3,3,2,0,0,0,0,0),
        ARR32(x,0,0,0,0,0,0,0,2,2,2,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,3,3,2,2,2,0),
        ARR32(x,0,0,0,2,2,2,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,1,1,1,2),
        ARR32(x,2,2,4,4,4,4,4,4,4,4,4,2,2,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
        ARR32(x,4,4,4,4,4,4,2,2,2,2,4,4,4,2,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0),
        ARR32(x,4,4,4,2,2,2,4,4,4,4,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2),
        2,
        2);
    }
    else
    {
        x -= 32;
        return ARR8(y,
        ARR32(x,0,0,2,2,2,4,4,4,4,4,4,4,3,3,3,3,3,3,3,2,2,2,2,0,0,0,0,0,0,0,0,0),
        ARR32(x,0,0,0,0,0,0,0,2,2,4,4,3,3,3,3,2,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2),
        ARR32(x,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,4,4,4,4,2,4,2,0,0,0,0),
        ARR32(x,1,1,1,1,1,2,2,2,2,2,2,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,2),
        ARR32(x,0,0,0,1,1,1,1,1,3,3,3,3,3,3,2,2,0,0,0,0,0,0,0,0,0,0,0,2,4,4,4,4),
        ARR32(x,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4),
        ARR32(x,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,2),
        2);
    }
}

/*
*	A third frame of sweet wave action.
*	Note: The palette of the sunny and shadowed waves are
*	consolidated into a single map with a larger palette.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int wavesC(in int x, in int y)
{
    if(x < 32) // ARR64 would be a really long line.
    {
        return ARR8(y,
        ARR32(x,4,4,4,4,0,0,0,0,0,0,0,4,4,4,0,0,0,0,0,0,2,4,4,4,2,0,0,0,0,0,0,0),
        ARR32(x,2,0,0,0,3,4,4,2,0,0,0,0,0,0,0,0,2,2,4,4,4,2,2,2,4,2,2,0,0,4,4,4),
        ARR32(x,0,0,0,0,0,0,0,1,1,1,2,2,2,2,4,4,4,4,4,3,0,0,0,0,0,0,3,3,4,4,4,4),
        ARR32(x,0,0,0,0,0,0,0,0,0,1,1,1,3,3,3,3,3,3,0,0,0,0,0,3,3,3,4,4,4,3,4,1),
        ARR32(x,2,2,2,2,2,0,0,0,0,0,0,0,1,1,3,3,3,3,3,3,3,3,3,3,4,4,3,3,4,4,1,0),
        ARR32(x,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,2,4,4,4,4,4,4,4,4,4,4,1,0,0,0,0),
        ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,2,2,2),
        2);

    }
    else
    {
        x -= 32;
        return ARR8(y,
		ARR32(x,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,3,3,3,4,4,4,4,4),
		ARR32(x,4,4,4,4,3,2,2,2,0,0,0,0,0,0,1,1,1,1,1,1,3,3,3,3,3,4,4,4,4,4,4,4),
		ARR32(x,4,1,1,1,1,3,3,3,3,3,3,3,1,1,1,1,3,3,3,3,3,3,3,3,3,3,4,4,4,2,0,0),
		ARR32(x,1,1,0,0,0,0,0,0,0,0,2,3,3,3,3,3,4,3,2,2,2,3,4,4,4,4,1,0,0,0,2,2),
		ARR32(x,0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,3,4,4,3,3,0,0,0,2,2,2,2,2,2),
		ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2),
		2,
		2);
    }
}

/*
*	The forth frame of waves.
*	Note: The palette of the sunny and shadowed waves are
*	consolidated into a single map with a larger palette.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int wavesD(in int x, in int y)
{
    if(x < 32) // ARR64 would be a really long line.
    {
        return ARR8(y,
		ARR32(x,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,4,4,2,0,0,0,0,0,0,0,0,0,2),
		ARR32(x,2,2,2,2,2,4,4,4,4,3,2,2,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,3,4,4,4,4),
		ARR32(x,4,4,4,4,4,3,0,0,0,0,0,3,3,2,2,2,2,0,0,0,0,2,3,3,3,4,4,4,4,4,4,4),
		ARR32(x,3,3,3,2,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,3,0),
		ARR32(x,0,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,3,0,0,0,0,0),
		ARR32(x,0,0,0,0,0,0,0,0,0,0,0,1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,2,2,2,2,2,2),
		ARR32(x,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2),
		2);
    }
    else
    {
        x -= 32;
        return ARR8(y,
		ARR32(x,3,3,4,4,4,4,4,4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,0,0,0,0,0),
		ARR32(x,4,4,4,3,0,0,0,0,0,0,0,1,1,1,1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2),
		ARR32(x,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3),
		ARR32(x,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,3),
		ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0),
		ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0),
		2,
		2);
    }
}

/*
*	The wave draw function.
*   
*	Draws the waves using the appropriate palette given the position.
*	This also animates the waves.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of the waves at the given position.
*/
vec4 drawWaves(in int x, in int y)
{
    if(y < WAVES_Y) return TRANS;
    if(y > WAVES_Y+7) return L_BLUE;
    
    int t = int(mod(iGlobalTime*4.,4.));
    
    y -= WAVES_Y;
    
    if(x > SHORE_END)
    {            
        x = int(mod(float(x),32.0));
        return ARR4(t,
                    wavesSunnyPalette(wavesA(x,y)),
                    wavesSunnyPalette(wavesB(x,y)),
                    wavesSunnyPalette(wavesC(x,y)),
                    wavesSunnyPalette(wavesD(x,y)));
    }
    else
    {
        x = int(mod(float(x),32.0));
        return ARR4(t,
                    wavesShadowPalette(wavesA(x,y)),
                    wavesShadowPalette(wavesB(x,y)),
                    wavesShadowPalette(wavesC(x,y)),
                    wavesShadowPalette(wavesD(x,y)));
    }
}

/*
*	The palette of the white clouds.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 nearCloudsPalette(in int x)
{
	return ARR2(x, TRANS, WHITE);
}

/*
*	Cloud tile functions.
*	
*	What follows are the tile functions for the large white cloud.
*	Only the topmost sections with actual features are encoded.
*	The solid white interior is assumed.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int cloudA(in int x, in int y)
{
    // Do some bounds checking.
    // To the left or right? TRANSPARENT FOR YOU!
	if(x < CLOUD_A_X || x >= CLOUD_B_X) return 0;
    // Above this cloud tile? TRANSPARENT YOU AS WELL!
	if(y < CLOUD_A_Y) return 0;
    // Below the tile? OH YOU ARE MORE CLOUD HAVE CLOUD COLOR.
	if(y > CLOUD_A_Y+7) return 1;
	
    // Transform the coordinates to cloud space.
    x -= CLOUD_A_X;
    y -= CLOUD_A_Y;
	
    // Finally do the 2D binary lookup to get the actual color.
	return
	ARR8(y,
	  0,
	  ARR8(x,0,0,0,0,0,0,1,1),
	  ARR8(x,0,0,0,0,1,1,1,1),
	  ARR8(x,0,0,0,1,1,1,1,1),
	  ARR8(x,0,0,1,1,1,1,1,1),
	  ARR8(x,0,0,1,1,1,1,1,1),
	  ARR8(x,0,1,1,1,1,1,1,1),
	  ARR8(x,0,1,1,1,1,1,1,1)
	);
}
// Cloud tile B.
int cloudB(in int x, in int y)
{
	if(x < CLOUD_B_X || x >= CLOUD_C_X) return 0;
	if(y < CLOUD_B_Y) return 0;
	if(y > CLOUD_B_Y+7) return 1;
	
    x -= CLOUD_B_X;
    y -= CLOUD_B_Y;
	
	return
	ARR8(y,
	  0,
	  0,
	  ARR8(x,0,0,0,0,0,1,1,1),
	  ARR8(x,0,1,1,1,1,0,1,0),
	  ARR8(x,1,1,1,1,0,0,1,1),
	  ARR8(x,1,1,1,0,0,1,1,1),
	  ARR8(x,0,1,1,0,1,1,1,1),
	  ARR8(x,1,0,0,0,1,1,1,1)
	);
}
// Cloud tile C.
int cloudC(in int x, in int y)
{
	if(x < CLOUD_C_X || x >= CLOUD_D_X) return 0;
	if(y < CLOUD_C_Y) return 0;
	if(y > CLOUD_C_Y+3) return 1;
	
    x -= CLOUD_C_X;
    y -= CLOUD_C_Y;
	
	return
	ARR4(y,
	  0,
	  ARR16(x,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0),
	  ARR16(x,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0),
	  1
	);
}
// Cloud tile D.
int cloudD(in int x, in int y)
{
	if(x < CLOUD_D_X || x >= CLOUD_E_X) return 0;
	if(y < CLOUD_D_Y) return 0;
	if(y > CLOUD_D_Y+7) return 1;
	
    x -= CLOUD_D_X;
    y -= CLOUD_D_Y;
	
	return
	ARR8(y,
	  0,
	  ARR8(x,0,0,0,0,0,0,1,1),
	  ARR8(x,0,0,0,0,1,1,1,1),
	  ARR8(x,0,0,0,1,1,1,1,1),
	  ARR8(x,0,0,1,1,1,1,1,1),
	  ARR8(x,0,0,1,1,1,1,1,1),
	  ARR8(x,0,1,1,1,1,1,1,1),
	  ARR8(x,0,1,1,1,1,1,1,1)
	);
}
// Cloud tile E.
int cloudE(in int x, in int y)
{
	if(x < CLOUD_E_X || x >= CLOUD_F_X) return 0;
	if(y < CLOUD_E_Y) return 0;
	if(y > CLOUD_E_Y+7) return 1;
	
    x -= CLOUD_E_X;
    y -= CLOUD_E_Y;
	
	return
	ARR8(y,
	  0,
	  0,
	  ARR8(x,0,0,0,0,0,1,1,1),
	  ARR8(x,0,1,1,1,1,0,1,0),
	  ARR8(x,1,1,1,1,0,0,1,1),
	  ARR8(x,1,1,1,0,0,1,1,1),
	  ARR8(x,0,1,1,0,1,1,1,1),
	  ARR8(x,1,0,0,0,1,1,1,1)
	);
}
// Cloud tile F.
int cloudF(in int x, in int y)
{
	if(x < CLOUD_F_X || x >= CLOUD_G_X) return 0;
	if(y < CLOUD_F_Y) return 0;
	if(y > CLOUD_F_Y+15) return 1;
	
    x -= CLOUD_F_X;
    y -= CLOUD_F_Y;
	
	return
	ARR16(y,
	  ARR16(x,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0),
	  ARR16(x,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0),
	  ARR16(x,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,0),
	  ARR16(x,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0),
	  0,
	  ARR16(x,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0),
	  ARR16(x,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0),
	  0,
	  ARR16(x,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1),
	  ARR16(x,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1),
	  ARR16(x,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1),
	  ARR16(x,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1),
	  ARR16(x,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1),
	  ARR16(x,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1),
	  1,
	  ARR16(x,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1)
	);
}
// Cloud tile G.
int cloudG(in int x, in int y)
{
	if(x < CLOUD_G_X || x >= CLOUD_H_X) return 0;
	if(y < CLOUD_G_Y) return 0;
	if(y > CLOUD_G_Y+7) return 1;
	
    x -= CLOUD_G_X;
    y -= CLOUD_G_Y;
	
	return
	ARR8(y,
	  ARR8(x,0,0,0,0,0,0,1,1),
	  ARR8(x,0,0,0,0,1,1,1,1),
	  ARR8(x,1,1,0,1,1,1,1,1),
	  ARR8(x,1,0,1,1,1,1,1,1),
	  ARR8(x,0,1,1,1,1,1,1,1),
	  ARR8(x,0,1,1,1,1,1,1,1),
	  1,
	  1
	);
}
// Cloud tile H.
int cloudH(in int x, in int y)
{
	if(x < CLOUD_H_X || x >= CLOUD_I_X) return 0;
	if(y < CLOUD_H_Y) return 0;
	if(y > CLOUD_H_Y+7) return 1;
	
    x -= CLOUD_H_X;
    y -= CLOUD_H_Y;
	
	return
	ARR8(y,
	  ARR8(x,1,1,1,0,0,0,0,0),
	  ARR8(x,1,1,1,1,1,0,0,0),
	  ARR8(x,1,1,1,1,1,1,0,0),
	  ARR8(x,1,1,1,1,1,1,1,0),
	  ARR8(x,1,1,1,1,1,1,1,0),
	  1,
	  ARR8(x,1,1,1,1,1,0,1,0),
	  1
	);
}
// Cloud tile I.
int cloudI(in int x, in int y)
{
	if(x < CLOUD_I_X || x >= CLOUD_J_X) return 0;
	if(y < CLOUD_I_Y) return 0;
	if(y > CLOUD_I_Y+7) return 1;
	
    x -= CLOUD_I_X;
    y -= CLOUD_I_Y;
	
	return
	ARR8(y,
	  ARR8(x,1,1,0,0,0,0,0,0),
	  ARR8(x,1,1,1,0,0,1,1,0),
	  ARR8(x,1,1,1,0,0,0,1,0),
	  ARR8(x,1,1,1,1,0,0,0,0),
	  ARR8(x,1,1,1,1,0,0,0,0),
	  ARR8(x,1,1,1,1,0,0,0,0),
	  ARR8(x,1,1,1,0,1,0,0,0),
	  1
	);
}
// Cloud tile J.
int cloudJ(in int x, in int y)
{
	if(x < CLOUD_J_X || x >= CLOUD_K_X) return 0;
	if(y < CLOUD_J_Y) return 0;
	if(y > CLOUD_J_Y+7) return 1;
	
    x -= CLOUD_J_X;
    y -= CLOUD_J_Y;
	
	return
	ARR8(y,
	  ARR8(x,1,1,0,0,1,1,0,0),
	  ARR8(x,1,1,1,0,1,1,0,0),
	  ARR8(x,1,1,1,1,0,0,0,0),
	  ARR8(x,1,1,1,1,0,1,0,0),
	  ARR8(x,1,1,1,1,0,0,0,0),
	  ARR8(x,1,1,1,1,1,0,0,0),
	  ARR8(x,1,1,1,1,1,0,0,0),
	  ARR8(x,1,1,1,1,1,0,0,0)
	);
}
// Cloud tile K.
int cloudK(in int x, in int y)
{
	if(x < CLOUD_K_X || x >= CLOUD_L_X) return 0;
	if(y < CLOUD_K_Y) return 0;
	if(y > CLOUD_K_Y+3) return 1;
	
    x -= CLOUD_K_X;
    y -= CLOUD_K_Y;
	
	return
	ARR4(y,
	  0,
	  ARR8(x,0,0,1,0,0,0,1,1),
	  ARR8(x,1,1,1,1,0,1,1,1),
	  1
	);
}
// Cloud tile L.
int cloudL(in int x, in int y)
{
	if(x < CLOUD_L_X || x >= CLOUD_M_X) return 0;
	if(y < CLOUD_L_Y) return 0;
	if(y > CLOUD_L_Y+3) return 1;
	
    x -= CLOUD_L_X;
    y -= CLOUD_L_Y;
	
	x = int(mod(float(x),8.0));
	y = int(mod(float(y),4.0));
	
	return
	ARR4(y,
	  0,
	  ARR8(x,1,1,0,0,0,0,0,0),
	  ARR8(x,1,1,1,0,0,1,1,0),
	  1
	);
}
// CLoud tile M.
int cloudM(in int x, in int y)
{
	if(x < CLOUD_M_X || x >= CLOUD_N_X) return 0;
	if(y < CLOUD_M_Y) return 0;
	if(y > CLOUD_M_Y+7) return 1;
	
    x -= CLOUD_M_X;
    y -= CLOUD_M_Y;
	
	return
	ARR8(y,
	  0,
	  0,
	  ARR8(x,0,0,0,1,1,0,0,0),
	  ARR8(x,0,1,0,1,1,0,0,0),
	  ARR8(x,0,0,0,0,0,0,0,1),
	  ARR8(x,1,1,1,1,0,0,1,1),
	  1,
	  1
	);
}
// Cloud tile N.
int cloudN(in int x, in int y)
{
	if(x < CLOUD_N_X) return 0;
	if(y < CLOUD_N_Y) return 0;
	if(y > CLOUD_N_Y+3) return 1;
	
    x -= CLOUD_N_X;
    y -= CLOUD_N_Y;
	
	x = int(mod(float(x),32.0));
	y = int(mod(float(y),4.0));
	
	return
	ARR4(y,
	  ARR32(x,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0),
	  ARR32(x,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0),
	  1,
	  1
	);
}

vec4 drawNearClouds(in int x, in int y)
{
	vec4 result = vec4(0.0);
	result += nearCloudsPalette(cloudA(x,y));
	result += nearCloudsPalette(cloudB(x,y));
	result += nearCloudsPalette(cloudC(x,y));
	result += nearCloudsPalette(cloudD(x,y));
	result += nearCloudsPalette(cloudE(x,y));
	result += nearCloudsPalette(cloudF(x,y));
	result += nearCloudsPalette(cloudG(x,y));
	result += nearCloudsPalette(cloudH(x,y));
	result += nearCloudsPalette(cloudI(x,y));
	result += nearCloudsPalette(cloudJ(x,y));
	result += nearCloudsPalette(cloudK(x,y));
	result += nearCloudsPalette(cloudL(x,y));
	result += nearCloudsPalette(cloudM(x,y));
	result += nearCloudsPalette(cloudN(x,y));
	return result;
}

/*
*	The palette of the smaller clouds floating above.
*   
*	Returns a color given a palette index.
*
*	c: The color index to look up.
*
*	Returns: The corresponding color.
*/
vec4 smallCloudPalette(in int x)
{
	return ARR4(x, TRANS, WHITE, L_BLUE, TRANS);
}

/*
*	The tile function of the smaller part of the small clouds.
*   
*	Returns a palette index given a position.
*	Since this tile is repeated within the cloud, we have to
*	be able to specify where to draw it.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*	atx: The x position at which to draw the cloud.
*	aty: The y position at which to draw the cloud.
*
*	Returns: The corresponding palette index.
*/
int smallCloudA(in int x, in int y, in int atx, in int aty)
{
	if(x < atx || x > atx+7) return 0;
	if(y < aty || y > aty+3) return 0;
	
	x -= atx;
	y -= aty;
	
	x = int(mod(float(x),8.0));
	y = int(mod(float(y),4.0));
	
	return
	ARR4(y,
	  ARR8(x,0,0,0,0,2,2,0,0),
	  ARR8(x,0,0,2,1,1,0,2,0),
	  ARR8(x,1,0,0,1,2,0,0,0),
	  ARR8(x,2,0,0,2,0,0,0,0)
	);
}

/*
*	The tile representing the large part of the small cloud.
*   
*	Returns a palette index given a position.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The corresponding palette index.
*/
int smallCloudB(in int x, in int y)
{
	if(x < S_CLOUD_B_X || x > S_CLOUD_B_X+15) return 0;
	if(y < S_CLOUD_B_Y || y > S_CLOUD_B_Y+7) return 0;
	
	x -= S_CLOUD_B_X;
	y -= S_CLOUD_B_Y;
	
	x = int(mod(float(x),16.0));
	y = int(mod(float(y),8.0));
	
	
	return
	ARR8(y,
	  ARR16(x,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0),
	  ARR16(x,1,2,0,0,1,1,1,0,0,0,0,0,0,0,0,0),
	  ARR16(x,0,0,0,1,1,1,1,2,0,1,1,0,0,0,0,0),
	  ARR16(x,0,0,2,1,1,1,1,2,1,1,1,2,0,1,0,0),
	  ARR16(x,0,0,2,1,1,1,2,2,2,0,2,1,0,0,0,1),
	  ARR16(x,2,1,0,2,2,2,0,2,0,0,0,0,0,0,0,0),
	  0,
	  0
	);
}

/*
*	The small cloud's draw function.
*
*	Draws the smaller cloud to the screen.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of the cloud from under the current texel.
*/
vec4 drawSmallCloud(in int x, in int y)
{
	vec4 result = vec4(0.0);
	result += smallCloudPalette(smallCloudA(x,y,S_CLOUD_A_X,S_CLOUD_A_Y));
	result += smallCloudPalette(smallCloudB(x,y));
	result += smallCloudPalette(smallCloudA(x,y,S_CLOUD_C_X,S_CLOUD_C_Y));
	return result;
}

// Draws all sprites and tiles.
vec4 drawElements(in int x, in int y)
{
    vec4 farClouds = drawFarClouds(x,y);
	vec4 nearClouds = drawNearClouds(x,y);
    vec4 smallCloud = drawSmallCloud(x,y);
    vec4 birds = drawBirds(x,y);
    vec4 shore = drawShore(x,y);
    vec4 yumetarou = drawYumetarou(x,y);
    vec4 waves = drawWaves(x,y);
    
    // Overriting blending using alpha, since every sprite returns a value for every pixel.
    vec4 result = mix(farClouds, nearClouds, nearClouds.a);
    result = mix(result,smallCloud,smallCloud.a);
    result = mix(result,birds,birds.a);
    result = mix(result,shore,shore.a);
    result = mix(result,waves,waves.a);
    result = mix(result,yumetarou, yumetarou.a);
    return result;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Normalize coordinates.
    fragCoord = (fragCoord.xy / iResolution.xy);
    
    // Invert the Y axis.
    fragCoord.y = 1.0-fragCoord.y;
    
    // Account for aspect ratio.
    fragCoord.x *= iResolution.x/iResolution.y;
    
    // Let's get NES sized pixels. This is the Y-resolution of Gimmick's screen sans-HUD.
    // We also have to account for the fact that the NES didn't have square pixels.
    fragCoord *= vec2(184.0*0.85736,184.0);
    
    // Default the outgoing fragColor to the background color.
    fragColor = D_BLUE;
    ivec2(fragCoord);
    // Determine and store the texel of the scene elements this pixel occupies.
    vec4 imageElements = drawElements(int(fragCoord.x), int(fragCoord.y));
    
	// Mix this texel with the background.
	fragColor = mix(fragColor, imageElements, imageElements.a);
}
