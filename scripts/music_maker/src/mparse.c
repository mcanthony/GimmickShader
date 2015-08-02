#include "mparse.h"

FILE *track_file;

float amp;
float duty;
float step_prog;
float step_size;
wavetype wave_sel;

#define AMP_DEFAULT 0.15
#define DUTY_DEFAULT 0.5
#define STEP_SIZE_DEFAULT 0.0
#define WAVE_SEL_DEFAULT pulse

#define LINE_BUFFER_SIZE 64

int parse_init(const char *fname)
{
	if (track_file)
	{
		fclose(track_file);
	}
	track_file = fopen(fname,"r");
	if (!track_file)
	{
		fprintf(stderr,"Error: Couldn't open file %s.\n",fname);
		return 0;
	}

	amp = AMP_DEFAULT;
	duty = DUTY_DEFAULT;
	step_size = STEP_SIZE_DEFAULT; 
	wave_sel = WAVE_SEL_DEFAULT;
	step_prog = 0;
	return 1;
}

char *get_arg_to(const char *comp, char *line)
{
	if (!line || !comp)
	{
		fprintf(stderr,"Error: Nonsense arguments to get_arg_to\n");
		return NULL;
	}
	int wordlen = 0;
	char *line_buffer = (char *)malloc(sizeof(char) * LINE_BUFFER_SIZE + 1);
	memset(line_buffer, 0, sizeof(char) * LINE_BUFFER_SIZE + 1);
	strncpy(line_buffer,line,LINE_BUFFER_SIZE);
	for (int i = 0; i < LINE_BUFFER_SIZE; i++)
	{
		if (comp[i] == '\0' || comp[i] == '\n')
		{
			wordlen = i;
			break;
		}
	}

	for (int i = 0; i < LINE_BUFFER_SIZE; i++)
	{
		if (line_buffer[i] == '\n')
		{
			line_buffer[i] = '\0';
		}
		if (line_buffer[i] == '\0')
		{
			break;
		}
	}

	for (int i = 0; i < wordlen; i++)
	{
		if ((comp[i] | 0x20) != (line_buffer[i] | 0x20))
		{
			free(line_buffer);
			return NULL;
		}
	}

	char *ret_buffer = (char *)malloc(sizeof(char) * LINE_BUFFER_SIZE + 1);
	strncpy(ret_buffer,line_buffer + wordlen, LINE_BUFFER_SIZE - wordlen);
	free(line_buffer);
	return ret_buffer;
}

void handle_line(char *line)
{
	float freq = 0.0;
	int octave = -1;
	char *check = NULL;
	check = get_arg_to("reset",line);
	if (check)
	{
		step_prog = 0;
		goto handle_line_finished;
	}

	check = get_arg_to("step ",line);
	if (check)
	{
		step_size = (float)strtof(check,0);
		goto handle_line_finished;
	}

	check = get_arg_to("amp ",line);
	if (check)
	{
		amp = (float)strtof(check,0);
		goto handle_line_finished;
	}

	check = get_arg_to("duty ",line);
	if (check)
	{
		duty = (float)strtof(check,0);
		goto handle_line_finished;
	}

	check = get_arg_to("wave ",line);
	if (check)
	{
		wave_sel = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}

// Notes
	check = get_arg_to("C ",line);
	if (check)
	{
		freq = NOTE_C;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("C# ",line);
	if (check)
	{
		freq = NOTE_CS;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("D ",line);
	if (check)
	{
		freq = NOTE_D;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("D# ",line);
	if (check)
	{
		freq = NOTE_DS;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("E ",line);
	if (check)
	{
		freq = NOTE_E;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("F ",line);
	if (check)
	{
		freq = NOTE_F;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("F# ",line);
	if (check)
	{
		freq = NOTE_FS;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("G ",line);
	if (check)
	{
		freq = NOTE_G;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("G# ",line);
	if (check)
	{
		freq = NOTE_GS;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("A ",line);
	if (check)
	{
		freq = NOTE_A;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("A# ",line);
	if (check)
	{
		freq = NOTE_AS;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("B ",line);
	if (check)
	{
		freq = NOTE_B;
		octave = (int)strtoul(check,NULL,0);
		goto handle_line_finished;
	}
	check = get_arg_to("-",line);
	if (check)
	{
		freq = 0;
		octave = -1;
		goto handle_line_finished;
	}

handle_line_finished:
	if (check)
	{
		free(check);
		print_line(freq, octave);
	}
	return;
	
}

void print_line(float freq, int octave)
{
	if (octave <= 0)
	{
		return;
	}
	char instr[16];
	memset(instr,0,sizeof(char) * 16);
	switch(wave_sel)
	{
		default:
		case pulse:
			strcpy(instr, "pulse");
			break;
		case saw:
			 strcpy(instr, "saw");
			break;
		case tri:
			strcpy(instr, "tri");
			break;
		case sine:
			strcpy(instr, "sine");
			break;
		case noise:
			strcpy(instr, "noise");
			break;
	}

	float start = step_prog;
	float end = step_prog + step_size;
	printf("\tplayNote(t, %f, %f, %f, %s, %f, %f)\n + ",
		freq * (1 << octave),duty,amp,
		instr,start,end);
}

void read_loop(void)
{
	if (!track_file)
	{
		fprintf(stderr,"Error: File is not open, nothing to read!\n");
		return;
	}
	printf("return ");
	char *line_buffer = (char *)malloc(sizeof(char) * LINE_BUFFER_SIZE + 1);
	memset(line_buffer,0,sizeof(char) * LINE_BUFFER_SIZE + 1);
	while (fgets(line_buffer, LINE_BUFFER_SIZE, track_file))
	{
		step_prog += step_size;
		handle_line(line_buffer);
	}
	fclose(track_file);
	printf("0.0;\n");
	free (line_buffer);

}
