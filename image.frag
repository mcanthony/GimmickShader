// A recreation of the extra little shoreline scene from stage 2 of 
// Gimmick! (Or in PAL regions, Mr. Gimmick).
//     
// Original game by Sunsoft: https://en.wikipedia.org/wiki/Gimmick!
// 
// Original graphics design: Hiroyuki Kagoya
// Original music composition: Masashi Kageyama
//
// Shader graphics: 
//		Gerard Geer
//		(https://github.com/gerard-geer)
//		(https://www.shadertoy.com/user/hamneggs)
//
// Shader sound and ShaderTracker sound engine: 
//		Michael Moffitt 
//		(https://github.com/mikejmoffitt) 
//		(https://www.shadertoy.com/user/mikejmoffitt)
//
// This shader on github: https://github.com/gerard-geer/GimmickShader/
// ShaderTracker on github: https://github.com/Mikejmoffitt/ShaderTracker/
//
// In our experience this works best (maybe only) in Firefox.

// Nah we don't need precision.
precision lowp int;
precision lowp float;

// Quality definitions. Uncomment if you're feeling lucky, or are using a
// browser that doesn't impose a timeout on compilation times.
// #define DRAW_CLOUDS
// #define DRAW_WAVES
// #define DRAW_ALL_BIRDS

// A 2,4,8,16, or 32 element array implemented as a binary search, #defined for type agnosticity.
#define ARR32(x_, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p, q,r,s,t,u,v,w,x,y,z,aa,ab,ac,ad,ae,af) (x_<16) ? ARR16(x_, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p) : ARR16(x_-16,q,r,s,t,u,v,w,x,y,z,aa,ab,ac,ad,ae,af)

int ARR2(in int x, in int a, in int b)
{
    if(x<1) return a;
    return b;
}

vec4 ARR2(in int x, in vec4 a, in vec4 b)
{
    if(x<1) return a;
    return b;
}

int ARR4(in int x, in int a, in int b, in int c, in int d)
{
    if(x<2) return ARR2(x,a,b);
    return ARR2(x-2,c,d);
}

vec4 ARR4(in int x, in vec4 a, in vec4 b, in vec4 c, in vec4 d)
{
    if(x<2) return ARR2(x,a,b);
    return ARR2(x-2,c,d);
}

int ARR8(in int x, in int a, in int b, in int c, in int d,
			       in int e, in int f, in int g, in int h)
{
    if(x<4) return ARR4(x, a,b,c,d);
    return ARR4(x-4, e,f,g,h);
}

vec4 ARR8(in int x, in vec4 a, in vec4 b, in vec4 c, in vec4 d,
			   	    in vec4 e, in vec4 f, in vec4 g, in vec4 h)
{
    if(x<4) return ARR4(x, a,b,c,d);
    return ARR4(x-4, e,f,g,h);
}

int ARR16(in int x, in int a, in int b, in int c, in int d,
			        in int e, in int f, in int g, in int h,
         			in int i, in int j, in int k, in int l,
         			in int m, in int n, in int o, in int p)
{
    if(x<8) return ARR8(x, a,b,c,d, e,f,g,h);
    return ARR8(x-8, i,j,k,l, m,n,o,p);
}

vec4 ARR16(in int x, in vec4 a, in vec4 b, in vec4 c, in vec4 d,
			   	     in vec4 e, in vec4 f, in vec4 g, in vec4 h,
         			 in vec4 i, in vec4 j, in vec4 k, in vec4 l,
         			 in vec4 m, in vec4 n, in vec4 o, in vec4 p)
{
    if(x<8) return ARR8(x, a,b,c,d, e,f,g,h);
    return ARR8(x-8, i,j,k,l, m,n,o,p);
}

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
const vec4 BROWN   = vec4(.486, .031, .000, 1.00);
const vec4 TRANS   = vec4(.000, .000, .000, .000);

// Define out stuff so we don't have to pass the values as parameters.
const int YUMETAROU_X = 52;
const int YUMETAROU_Y = 117;
const int SHORE_Y = 136;
const int SHORE_END = 79;
const int FAR_CLOUD_Y = 128;
const int WAVES_Y = 168;
const int BIRD_A_Y = 20;
const int BIRD_B_Y = 32;
const int BIRD_C_Y = 45;
const int BIRD_D_Y = 53;
const int BIRD_E_Y = 62;
const int BIRD_F_Y = 69;
const int BIRD_G_Y = 72;
const float BIRD_FLIP_FREQUENCY = .23438;

// The big cloud takes a lot of orchestration. These are the coordinates
// of the individual tiles.
// The cloud tiles represent only the detailed upper portions of it.
// Anything below them is drawn in as white.
const int CLOUD_A_X = 97;
const int CLOUD_A_Y = 160;
const int CLOUD_B_X = 105;
const int CLOUD_B_Y = 152;
const int CLOUD_C_X = 113;
const int CLOUD_C_Y = 153;
const int CLOUD_D_X = 129;
const int CLOUD_D_Y = 144;
const int CLOUD_E_X = 137;
const int CLOUD_E_Y = 136;
const int CLOUD_F_X = 145;
const int CLOUD_F_Y = 128;
const int CLOUD_G_X = 161;
const int CLOUD_G_Y = 128;
const int CLOUD_H_X = 169;
const int CLOUD_H_Y = 128;
const int CLOUD_I_X = 177;
const int CLOUD_I_Y = 136;
const int CLOUD_J_X = 185;
const int CLOUD_J_Y = 144;
const int CLOUD_K_X = 193;
const int CLOUD_K_Y = 153;
const int CLOUD_L_X = 201;
const int CLOUD_L_Y = 153;
const int CLOUD_M_X = 217;
const int CLOUD_M_Y = 154;
const int CLOUD_N_X = 225;
const int CLOUD_N_Y = 152;

// The positioning of the smaller cloud.
const int S_CLOUD_A_X = 184;
const int S_CLOUD_A_Y = 115;
const int S_CLOUD_B_X = 192;
const int S_CLOUD_B_Y = 112;
const int S_CLOUD_C_X = 216;
const int S_CLOUD_C_Y = 115;
    
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
    c-=4;
    return ARR2(c, 	D_GOLD, 	// Dark gold.
                	TRANS);  	// Transparency.
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
              return 	 ARR16(x,1,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0);
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
        	  return 	 ARR16(x,1,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0);
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
    
    // Get the palette index.
    int n;
    if( t < .066 ) n = yumetarouEyesClosed(x,y);
    else if( t > .533 && t < .600 ) n = yumetarouEyesClosed(x,y);
    else n = yumetarouEyesOpen(x,y);
        
    // Return the color.
    return yumetarouPalette(n);
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
    return 3;
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
    return		 ARR8(x,3,3,3,1,0,3,3,3);
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
    return		 ARR8(x,3,3,2,3,3,3,2,3);
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
    // Bounds checking.
    if(x < atx || x > atx + 7) return vec4(0.0);
    if(y < aty || y > aty + 4) return vec4(0.0);
    
    // Transform coordinates to bird space.
    x -= atx;
    y -= aty;
    
    // Flip the bird if necessary.
    if(flip) x = 7-x;
    
    // This animation is less framecounting and more dividing an amount
    // of time by four.
    int t = int(mod(iGlobalTime*7.5, 4.0));
    int n = ARR4(t,
                birdWingsLevel(x,y),
                birdWingsUp(x,y),
                birdWingsLevel(x,y),
                birdWingsDown(x,y));
    return birdPalette(n);
}



/*
*	The birds' animation function.
*   
*	Returns a modulated value by adding a triangle wave to the
*	starting value s.
*		
*	s: The starting position.
*	t: The current time within the function.
*	a: The amplitude of the triangle wave.
*	d: The boolean first derivative of the triangle function.
*
*	Returns: The modulated position.
*/
int anim(in int s, in float t, in float a, out bool d)
{
    // Triangle wave = |saw wave|
    
    // Let's get the derivative first.
    d = 2.0*(mod((t+1.0)*BIRD_FLIP_FREQUENCY, 1.0))-1.0 < 0.0;
    
    // Now that we've stored the direction let's go back and 
    // calculate the position.
    float val = abs( (mod((t)*BIRD_FLIP_FREQUENCY, 1.0)*2.0)-1.0 )*a;
    
    // Return the animated position.
	return s + int(val);
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
	
	// Getting the positioning and timing accurate to the actual game
	// was not fun. Frame-counting and screen-shooting dominated an
	// evening of mine. Should have bit the bullet and looked at a
	// disassembly.
	// Each bird's flight path lasts 128 frames each way. However
	// those path start times differ, as well as the length of the path.
    
    bool f; // For directional awareness.
	
	// Bird 1.
    int a = anim(110, iGlobalTime, 32.0, f);
    vec4 result = drawBird(x,y,a,BIRD_A_Y,f);
	
	// Bird 2.
    #ifdef DRAW_ALL_BIRDS
    a = anim(140, iGlobalTime+3.267, 24.0, f);
    result += drawBird(x,y,a,BIRD_B_Y,f);
	#endif
    
	// Bird 3.
    #ifdef DRAW_ALL_BIRDS
    a = anim(77, iGlobalTime+1.533, 40.0, f);
    result += drawBird(x,y,a,BIRD_C_Y,f);
	#endif
    
	// Bird 4.
    a = anim(198, iGlobalTime+.1667, 32.0, f);
    result += drawBird(x,y,a,BIRD_D_Y,f);
	
	// Bird 5.
    a = anim(141, iGlobalTime+.5667, 32.0, f);
    result += drawBird(x,y,a,BIRD_E_Y,f);
	
	// Bird 6.
    a = anim(85, iGlobalTime+1.067, 24.0, f);
    result += drawBird(x,y,a,BIRD_F_Y,f);
	
	// Bird 7.
	#ifdef DRAW_ALL_BIRDS
    a = anim(165, iGlobalTime+1.167, 24.0, f);
    result += drawBird(x,y,a,BIRD_G_Y,f);
	#endif
    
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
    // This element repeats in the X direction.
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
			 ARR2 (x/4,ARR8(x, 1,1,1,1,1,1,2,2),                                   1),
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
            ARR2 (x/14,3,                         2),
            ARR2 (x/12,0, 		  ARR4(x-12,0,1,2,3)),
            ARR2 (x/12,1, 		  ARR4(x-12,1,1,2,3)),
            ARR2 (x/12,1, 		  ARR4(x-12,1,1,2,3)),
            ARR2 (x/12,1, 		  ARR4(x-12,1,1,2,3)),
            ARR2 (x/12,1, 		  ARR4(x-12,1,1,2,3)),
            ARR2 (x/12,1, 		  ARR4(x-12,1,1,2,3)),
            ARR2 (x/12,1, 		  ARR4(x-12,1,2,2,3)),
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
    // Bounds checking.
    if(x > SHORE_END) return vec4(0.0);
    if(y < SHORE_Y) return vec4(0.0);
    
    // Transform to be relative to the shore tiles.
    y -= SHORE_Y;
    
    // Get the palette index.
    int n;
    if(x < 64) n = shoreInterior(x,y);
    else n = shoreExterior(x-64,y);
    
    // Finally return the correct color.
    return shorePalette(n);
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
    // The clouds repeat along the X axis across the entire screen.
    x = int(mod(float(x),32.0));
    if(y < 4)
    {
        return ARR4(y, 
        ARR2 (x/16,0,                ARR16(x-16,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0)),
        ARR2 (x/16,0,                ARR16(x-16,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0)),
        ARR32(x,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0),
        ARR32(x,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0));
    }
    return ARR2 (x/16,1, ARR16(x-16,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1));
}

/*
*	The distant cloud draw function.
*   
*	Draws the dark, distant clouds to the screen.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of the far clouds at the given position.
*/
vec4 drawFarClouds(in int x, in int y)
{
    // Above? Nada.
    if(y < FAR_CLOUD_Y) return TRANS;
    // Below? Fill'er'in.
    if(y > FAR_CLOUD_Y+5) return L_BLUE;
    // Within the narrow band designated for the clouds?
    int n = farClouds(x,y-FAR_CLOUD_Y);
    return farCloudsPalette(n);
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
			   			WHITE,
			   			L_BLUE,
			   			WHITE);
    }
    else return ARR2(x-4, D_BLUE, L_BLUE);
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
					   L_BLUE,
					   L_BLUE,
					   WHITE);
    }
    else return ARR2(x-4, WHITE, WHITE);
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
       	ARR32(x,3,3,3,3,3,3,3,3,3,5,5,5,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,3,3,3),
		ARR32(x,3,3,3,2,2,0,0,0,0,2,5,5,5,5,5,5,3,3,3,3,3,5,5,2,2,2,0,0,0,0,0,0),
		ARR32(x,3,2,0,0,0,0,0,0,0,0,0,0,2,3,3,3,3,2,0,0,0,0,5,5,5,5,5,5,2,2,2,2),
		ARR32(x,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5),
		ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5),
		ARR2(x/16,2,			     ARR16(x-16,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0)),
		2,
        2);
    }
    x -= 32;
    return ARR8(y,
    ARR32(x,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,3,3,3,0,0,0,0,0,0,0,0,0,3,3,3),
    ARR32(x,0,0,0,0,2,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3),
    ARR32(x,2,2,1,3,3,3,2,2,2,5,0,0,0,0,0,0,0,0,5,5,3,3,3,3,3,3,3,3,2,3,3,3),
    ARR32(x,3,3,3,2,0,0,0,0,0,0,0,0,0,0,5,5,5,3,3,3,3,3,3,2,2,2,3,3,3,3,2,0),
    ARR32(x,5,5,5,5,5,5,2,0,0,0,0,5,5,3,3,3,3,3,3,3,2,2,2,3,3,3,3,2,0,0,0,2),
    ARR32(x,0,0,0,0,0,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2),
    2,
    2);
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
		ARR32(x,2,2,2,2,2,0,0,0,0,0,0,0,0,2,2,3,3,3,3,3,3,3,3,3,5,5,2,0,0,0,0,0),
        ARR32(x,0,0,0,0,0,0,0,2,2,2,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,5,5,2,2,2,0),
        ARR32(x,0,0,0,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,4,4,4,2),
        ARR32(x,2,2,3,3,3,3,3,3,3,3,3,2,2,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4),
        ARR32(x,3,3,3,3,3,3,2,2,2,2,3,3,3,2,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0),
        ARR32(x,3,3,3,2,2,2,3,3,3,3,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2),
		2,
        2);
	}
    x -= 32;
    return ARR8(y,
    ARR32(x,0,0,2,2,2,3,3,3,3,3,3,3,5,5,5,5,5,5,5,2,2,2,2,0,0,0,0,0,0,0,0,0),
    ARR32(x,0,0,0,0,0,0,0,2,2,3,3,5,5,5,5,2,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2),
    ARR32(x,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,3,3,3,3,2,3,2,0,0,0,0),
    ARR32(x,4,4,4,4,4,2,2,2,2,2,2,0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,2),
    ARR32(x,0,0,0,4,4,4,4,4,5,5,5,5,5,5,2,2,0,0,0,0,0,0,0,0,0,0,0,2,3,3,3,3),
    ARR32(x,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3),
    ARR32(x,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,2),
    2);
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
        ARR32(x,3,3,3,3,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,2,3,3,3,2,0,0,0,0,0,0,0),
        ARR32(x,2,0,0,0,5,3,3,2,0,0,0,0,0,0,0,0,2,2,3,3,3,2,2,2,3,2,2,0,0,3,3,3),
        ARR32(x,0,0,0,0,0,0,0,4,4,4,2,2,2,2,3,3,3,3,3,5,0,0,0,0,0,0,5,5,3,3,3,3),
        ARR32(x,0,0,0,0,0,0,0,0,0,4,4,4,5,5,5,5,5,5,0,0,0,0,0,5,5,5,3,3,3,1,3,4),
        ARR32(x,2,2,2,2,2,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,3,3,1,1,3,3,4,0),
        ARR32(x,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,2,3,3,3,3,3,3,3,3,3,3,4,0,0,0,0),
        ARR2 (x/16,2,                ARR16(x-16,2,2,2,2,2,2,2,2,0,0,0,0,0,2,2,2)),
        2);

    }
    x -= 32;
    return ARR8(y,
	ARR32(x,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,5,5,3,3,3,3,3),
	ARR32(x,3,3,3,3,5,2,2,2,0,0,0,0,0,0,4,4,4,4,4,4,5,5,5,5,5,3,3,3,3,3,3,3),
	ARR32(x,3,4,4,4,4,5,5,5,5,5,5,5,4,4,4,4,5,5,5,5,5,5,5,1,1,1,3,3,3,2,0,0),
	ARR32(x,4,4,0,0,0,0,0,0,0,0,2,5,5,5,5,5,3,1,2,2,2,1,3,3,3,3,4,0,0,0,2,2),
	ARR32(x,0,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,1,3,3,5,5,0,0,0,2,2,2,2,2,2),
	ARR32(x,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2),
	2,
	2);
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
		ARR32(x,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,3,3,2,0,0,0,0,0,0,0,0,0,2),
		ARR32(x,2,2,2,2,2,3,3,3,3,1,2,2,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,5,3,3,3,3),
		ARR32(x,3,3,3,3,3,1,0,0,0,0,0,5,5,2,2,2,2,0,0,0,0,2,5,5,5,3,3,3,3,3,3,3),
		ARR32(x,5,5,5,2,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,3,3,3,3,3,3,3,3,5,0),
		ARR32(x,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,3,3,3,3,3,3,3,5,0,0,0,0,0),
		ARR32(x,0,0,0,0,0,0,0,0,0,0,0,4,3,3,3,3,3,3,3,3,0,0,0,0,0,0,2,2,2,2,2,2),
		ARR2 (x/16,ARR16(x,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2),                  2),
		2);
    }
    x -= 32;
    return ARR8(y,
	ARR32(x,5,5,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,0,0,0,0,0),
	ARR32(x,3,3,3,5,0,0,0,0,0,0,0,4,4,4,4,5,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2),
	ARR32(x,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5),
	ARR32(x,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,5),
	ARR2 (x/16,2,               ARR16(x-16,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0)),
	ARR2 (x/16,2,               ARR16(x-16,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0)),
	2,
	2);
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
    // Bounds checking.
    if(y < WAVES_Y) return TRANS;
  	
    #ifndef DRAW_WAVES
    return D_BLUE;
    #endif
    
    if(y > WAVES_Y+7) return L_BLUE;
    
    
    // Modulo the time and cast it to an int so the value returned
    // can be used as an index for which frame of animation to use.
    int t = int(mod(iGlobalTime*6.0,4.0));
    
    // We need to do the usual transform here as well.
    y -= WAVES_Y;
    
    // Create a repeating x.
    int mx = int(mod(float(x),64.0));
            
    // Get the palette indices ahead of time.
    int a = wavesA(mx,y);
    int b = wavesB(mx,y);
    int c = wavesC(mx,y);
    int d = wavesD(mx,y);
    
    // If we are under the shoreline, we need to use the palette
    // that reflects the shore.
    if(x > SHORE_END)
    {
        return ARR4(t,
        wavesSunnyPalette(c),
        wavesSunnyPalette(a),
        wavesSunnyPalette(b),
        wavesSunnyPalette(d));
    }
    // otherwise we use the palette that reflects the clouds.
    return ARR4(t,
    wavesShadowPalette(c),
    wavesShadowPalette(a),
    wavesShadowPalette(b),
    wavesShadowPalette(d));
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
	if(y > CLOUD_C_Y+1) return 1;
	
    x -= CLOUD_C_X;
    y -= CLOUD_C_Y;
	
	return
	ARR2(y,
	  ARR16(x,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0),
	  ARR16(x,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0)
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
	if(y > CLOUD_K_Y+1) return 1;
	
    x -= CLOUD_K_X;
    y -= CLOUD_K_Y;
	
	return
	ARR2(y,
	  ARR8(x,0,0,1,0,0,0,1,1),
	  ARR8(x,1,1,1,1,0,1,1,1)
	);
}
// Cloud tile L. This one is repeated twice along X.
int cloudL(in int x, in int y)
{
	if(x < CLOUD_L_X || x >= CLOUD_M_X) return 0;
	if(y < CLOUD_L_Y) return 0;
	if(y > CLOUD_L_Y+1) return 1;
	
    x -= CLOUD_L_X;
    y -= CLOUD_L_Y;
	
	x = int(mod(float(x),8.0));
	
	return
	ARR2(y,
	  ARR8(x,1,1,0,0,0,0,0,0),
	  ARR8(x,1,1,1,0,0,1,1,0)
	);
}
// CLoud tile M.
int cloudM(in int x, in int y)
{
	if(x < CLOUD_M_X || x >= CLOUD_N_X) return 0;
	if(y < CLOUD_M_Y) return 0;
	if(y > CLOUD_M_Y+3) return 1;
	
    x -= CLOUD_M_X;
    y -= CLOUD_M_Y;
	
	return
	ARR4(y,
	  ARR8(x,0,0,0,1,1,0,0,0),
	  ARR8(x,0,1,0,1,1,0,0,0),
	  ARR8(x,0,0,0,0,0,0,0,1),
	  ARR8(x,1,1,1,1,0,0,1,1)
	);
}
// Cloud tile N. This is repeated to coda.
int cloudN(in int x, in int y)
{
	if(x < CLOUD_N_X) return 0;
	if(y < CLOUD_N_Y) return 0;
	if(y > CLOUD_N_Y+1) return 1;
	
    x -= CLOUD_N_X;
    y -= CLOUD_N_Y;
	
	x = int(mod(float(x),32.0));
	
	return
	ARR2(y,
	  ARR32(x,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,0,0),
	  ARR32(x,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0)
	);
}

/*
*	The large cloud draw function.
*
*	Composites all the large cloud tiles together and
*	draws them to the screen.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of the cloud from under the current fragment.
*/
vec4 drawNearClouds(in int x, in int y)
{
    #ifndef DRAW_CLOUDS
    return TRANS;
    #endif
    
    // The usual broken-apart additive blending.
    int n = cloudA(x,y);
	vec4 result = nearCloudsPalette(n);
    n = cloudB(x,y);
	result += nearCloudsPalette(n);
    n = cloudC(x,y);
	result += nearCloudsPalette(n);
    n = cloudD(x,y);
	result += nearCloudsPalette(n);
    n = cloudE(x,y);
	result += nearCloudsPalette(n);
    n = cloudF(x,y);
	result += nearCloudsPalette(n);
    n = cloudG(x,y);
	result += nearCloudsPalette(n);
    n = cloudH(x,y);
	result += nearCloudsPalette(n);
    n = cloudI(x,y);
	result += nearCloudsPalette(n);
    n = cloudJ(x,y);
	result += nearCloudsPalette(n);
    n = cloudK(x,y);
	result += nearCloudsPalette(n);
    n = cloudL(x,y);
	result += nearCloudsPalette(n);
    n = cloudM(x,y);
	result += nearCloudsPalette(n);
    n = cloudN(x,y);
	result += nearCloudsPalette(n);
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
	
	return
	ARR8(y,
	  ARR2 (x/2,1,                          0),
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
*	Returns: The color of the cloud from under the current fragment.
*/
vec4 drawSmallCloud(in int x, in int y)
{   
    #ifndef DRAW_CLOUDS
    return TRANS;
    #endif
    
    // First small cloud A.
    int n = smallCloudA(x,y,S_CLOUD_A_X,S_CLOUD_A_Y);
	vec4 result = smallCloudPalette(n);
    // Small cloud B.
    n = smallCloudB(x,y);
	result += smallCloudPalette(n);
    // And A again in a different position.
    n = smallCloudA(x,y,S_CLOUD_C_X,S_CLOUD_C_Y);
	result += smallCloudPalette(n);

	return result;
}

/*
*	The boat draw function.
*
*	Draws the boat in the corner. Unlike all the other art,
*	this doesn't use the LUT approach.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of the cloud from under the current fragment.
*/
vec4 drawBoat(in int x, in int y)
{
	// Oh look the boat looks just like elementary inequality graphs...
    x = -x; // save time, negate x.
    // Most common case is the first checked.
	if (y > 2*x + 71 || y > x + 40) return TRANS;
	if(y > 2*x + 24) return BLACK;
    return BROWN;
	
}

/*
*	The global draw function.
*
*	Calculates the contribution of all scene elements to 
*	the current fragment.
*
*	x: The x position of the current fragment.
*	y: The y position of the current fragment.
*
*	Returns: The color of the entire scene under the current fragment.
*/
vec4 drawElements(in int x, in int y)
{
    
    // Reuse some variables.
    vec4 result = drawFarClouds(x,y);
    #ifdef DRAW_CLOUDS
    vec4 element = drawNearClouds(x,y);
    #endif
    #ifndef DRAW_CLOUDS
    vec4 element = vec4(0.0);
    #endif
    
    result = mix(result, element, element.a);
    element = drawSmallCloud(x,y);
    result = mix(result, element, element.a);
    element = drawBirds(x,y);
    result = mix(result, element, element.a);
    element = drawBoat(x,y);
    result = mix(result, element, element.a);
    element = drawShore(x,y);
    result = mix(result, element, element.a);
    element = drawYumetarou(x,y);
    result = mix(result, element, element.a);
    element = drawWaves(x,y);
    result = mix(result, element, element.a);
    
    return result;
}

/*
*	The main draw function.
*
*	Computes the color of the current fragment.
*
*	fragColor: The computed fragment color.
*	fragCoord: The coordinate of this fragment.
*/
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
    
    // Determine and store the texel of the scene elements this pixel occupies.
    vec4 imageElements = drawElements(int(fragCoord.x), int(fragCoord.y));
    
	// Mix this texel with the background.
	fragColor = mix(fragColor, imageElements, imageElements.a);
}
