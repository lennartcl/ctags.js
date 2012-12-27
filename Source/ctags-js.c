#include <stdio.h>
#include <string.h>
#include <ctags/parse.h>
#include <ctags/options.h>
#include <ctags/read.h>
#include <ctags/entry.h>
#include <emscripten.h>

//static langType getExtensionLanguage (const char *const extension);

void onLoaded(const char* file) {
  parseFile(file);
  // TODO: Delete file?!
}


void onError(const char* file) {
}


extern void parseURL(const char* url) __attribute__((used))
{
	static int init = 0;
	if (!init)
	{
		init = 1;
		initializeParsing();
		initOptions();
	}

	langType language = getFileLanguage (url);
	if (language == LANG_IGNORE || language == LANG_AUTO)
	{
		printf("Unknown file extension: %s\n", url);
		return;
	}

	FILE *file = fopen(url, "r");
	if (file)
	{
     	fclose(file);
      	onLoaded(url);
  	}
  	else
  	{
		emscripten_async_wget(
    		url, 
    		url,
   			onLoaded,
    		onError);
  	}
}


extern void addTotals (
	const unsigned int files, 
	const long unsigned int lines,
    const long unsigned int bytes)
{}


extern boolean isDestinationStdout (void)
{
	return TRUE;
}


extern void makeTagEntry (const tagEntryInfo *const tag)
{
	printf("%-40s %-10s %-5i %s\n", tag->name, tag->kindName, tag->lineNumber, tag->sourceFileName);
}


extern void initTagEntry (tagEntryInfo *const e, const char *const name)
{
	// Assert (File.source.name != NULL);
	memset (e, 0, sizeof (tagEntryInfo));
	e->lineNumberEntry = (boolean) (Option.locate == EX_LINENUM);
	e->lineNumber      = getSourceLineNumber ();
	e->language        = getSourceLanguageName ();
	e->filePosition    = getInputFilePosition ();
	e->sourceFileName  = getSourceFileTagPath ();
	e->name            = name;
}