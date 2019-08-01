<?php
/**
 * CakePHP 2.x Component for creating and reading Zip files
 * Class ZipComponent
 */
class ZipComponent extends Component
{
	/**
	 * The php Zip class being wrapped.
	 * @var ZipArchive
	 */
	private $zip;
	/**
	 * Create zip component. No settings needed.
	 * @param ComponentCollection $collection
	 * @param array $settings
	 */
	function __construct(ComponentCollection $collection, $settings = [])
	{
		parent::__construct($collection, $settings);
		$this->zip = new ZipArchive();
	}
	/**
	 * @param string $function
	 * @return mixed
	 */
	function __get($function)
	{
		return $this->zip->{$function};
	}
	/**
	 * Opens a file for writing (Either existing or new file).
	 * Overwrite should be set to false for editing.
	 *
	 * @param string $path
	 * @param bool $overwrite
	 * @return boolean @params string, boolean $path : local path for zip $overwrite : usage :
	 */
	function begin($path = '', $overwrite = true)
	{
		$overwrite = ($overwrite) ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE;
		return $this->zip->open($path, $overwrite);
	}
	/**
	 * Closes the file.
	 * @return bool true on success or false on failure.
	 */
	function end()
	{
		return $this->close();
	}
	/**
	 * Closes the file handler.
	 * @return bool true on success or false on failure.
	 */
	function close()
	{
		return $this->zip->close();
	}
	/**
	 * Add a string as a file.
	 * @param $localFile
	 * @param $contents
	 * @return bool @params string, string $localFile : name of file in zip $contents : contents of file usage : $this->Zip->addByContents('myTextFile.txt', 'Test text file');
	 */
	function addByContent($localFile, $contents)
	{
		return $this->zip->addFromString($localFile, $contents);
	}
	/**
	 * Add a directory to the zip file.
	 * @param $directory
	 * @param $as
	 */
	function addDir($directory, $as)
	{
		$this->addDirectory($directory, $as);
	}
	/**
	 * Add a directory to the zip file.
	 * @param $directory
	 * @param $as
	 * @return boolean @params string, string
	 */
	function addDirectory($directory, $as)
	{
		if (substr($directory, -1, 1) != DS) {
			$directory = $directory . DS;
		}
		if (substr($as, -1, 1) != DS) {
			$as = $as . DS;
		}
		if (is_dir($directory)) {
			if ($handle = opendir($directory)) {
				while (false !== ($file = readdir($handle))) {
					if (is_dir($directory . $file . DS)) {
						if ($file != '.' && $file != '..') {
							// $this->addFile($directory.$file, $as.$file);
							$this->addDirectory($directory . $file . DS, $as . $file . DS);
						}
					} else {
						$this->addFile($directory . $file, $as . $file);
					}
				}
				closedir($handle);
			} else {
				return false;
			}
		} else {
			return false;
		}
		return true;
	}
	/**
	 * Add a file to the zip file.
	 * @param $file
	 * @param null $localFile
	 * @return bool @params string, string (optional) $file : file to be included (full path) $localFile : name of file in zip, if different
	 */
	function addFile($file, $localFile = null)
	{
		return $this->zip->addFile($file, (is_null($localFile) ? $file : $localFile));
	}
	/**
	 * Undo the last actions on the open zip file.
	 * @param string $mixed
	 * @return boolean @params mixed $mixed : undo changes to an archive by index(int), name(string), all ('all' | '*' | blank) usage : $this->Zip->undo(1); $this->Zip->undo('myText.txt'); $this->Zip->undo('*'); $this->Zip->undo('myText.txt, myText1.txt'); $this->Zip->undo(array(1, 'myText.txt'));
	 */
	function undo($mixed = '*')
	{
		if (is_array($mixed)) {
			foreach ($mixed as $value) {
				$constant = is_string($value) ? 'Name' : 'Index';
				if (!$this->zip->{'unchange' . $constant}($value)) {
					return false;
				}
			}
		} else {
			$mixed = explode(',', $mixed);
			if (in_array($mixed[0], [
				'*',
				'all'
			])) {
				if (!$this->zip->unchangeAll()) {
					return false;
				}
			} else {
				foreach ($mixed as $name) {
					if (!$this->zip->unchangeName($name)) {
						return false;
					}
				}
			}
		}
		return true;
	}
	/**
	 * Rename a file ($old) to $new
	 * @param $old
	 * @param null $new
	 * @return boolean @params mixed, string (optional)
	 */
	function rename($old, $new = null)
	{
		if (is_array($old)) {
			foreach ($old as $cur => $new) {
				$constant = is_string($cur) ? 'Name' : 'Index';
				if (!$this->zip->{'rename' . $constant}($cur, $new)) {
					return false;
				}
			}
		} else {
			$constant = is_string($old) ? 'Name' : 'Index';
			if (!$this->zip->{'rename' . $constant}($old, $new)) {
				return false;
			}
		}
		return true;
	}
	/**
	 * Returns either the name if an id is given or the id if a name is given.
	 * @param $mixed
	 * @param int $options
	 * @return int index , name or FALSE @params mixed, mixed (FL_NODIR, FL_NOCASE)
	 */
	function find($mixed, $options = 0)
	{
		if (is_string($mixed)) {
			return $this->zip->locatename($mixed, $options);
		} else {
			return $this->zip->getNameIndex($mixed);
		}
	}
	/**
	 * Removes a file from the archive.
	 * @param $mixed
	 * @return boolean @params mixed $mixed : undo changes to an archive by index(int), name(string), all ('all' | '*' | blank)
	 */
	function delete($mixed)
	{
		if (!is_array($mixed)) {
			$mixed = explode(',', $mixed);
		}
		foreach ($mixed as $value) {
			$constant = is_string($value) ? 'Name' : 'Index';
			if (!$this->zip->{'delete' . $constant}($value)) {
				return false;
			}
		}
        return true;
    }
	/**
	 * Add a comment to archive or file.
	 * @param string $mixed
	 * @param $comment
	 * @return bool @params mixed, string $mixed : comment by index(int), name(string), entire archive ('archive')
	 */
	function setComment($mixed = 'archive', $comment = null)
	{
		if (is_array($mixed)) {
			foreach ($mixed as $key => $value) {
				$constant = is_string($value) ? 'Name' : 'Index';
				if (!$this->zip->{'setComment' . $constant}($key, $value)) {
					return false;
				}
			}
		} else {
			if (strtolower($mixed) === 'archive') {
				return $this->zip->setArchiveComment($comment);
			} else {
				$constant = is_string($mixed) ? 'Name' : 'Index';
				return $this->zip->{'setComment' . $constant}($mixed, $comment);
			}
		}
		return true;
	}
	/**
	 * Get comment of archive or file.
	 * @param string $mixed
	 * @return bool @params mixed, string $mixed : comment by index(int), name(string), entire archive ('archive')
	 */
	function getComment($mixed = 'archive')
	{
		if (strtolower($mixed) === 'archive') {
			return $this->zip->getArchiveComment($mixed);
		} else {
			$constant = is_string($mixed) ? 'Name' : 'Index';
			return $this->zip->{'getComment' . $constant}($mixed);
		}
	}
	/**
	 * Return the stats of a given file.
	 * @param $mixed
	 * @return mixed
	 */
	function stats($mixed)
	{
		$constant = is_string($mixed) ? 'Name' : 'Index';
		return $this->zip->{'stat' . $constant}($mixed);
	}
	/**
	 * Extracts the archive ti a given location.
	 * @param $location
	 * @param null $entries
	 */
	function unzip($location, $entries = null)
	{
		$this->extract($location, $entries);
	}
	/**
	 * Extract the archive contents
	 * @param $destination
	 * @param null $entries
	 * @return bool @params string, mixed $entries : single name or array of names to extract, null to extract all
	 */
	function extract($destination, $entries = null)
	{
		return $this->zip->extractTo($destination, $entries);
	}
}