# -*- coding: utf-8 -*-
"""
@author: mz
"""
import os
from contextlib import ContextDecorator
from io import BytesIO
from random import choice
from time import time
from zipfile import ZipFile, ZIP_DEFLATED
from mmh3 import hash as mmh3_hash
from ujson import dumps as json_dumps

try:
    from .cy_misc import get_name
except:
    from magrit_app.helpers.cy_misc import get_name

LIST_CHAR = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100,
             101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
             113, 114, 115, 116, 117, 118, 119, 120, 121, 122]

def run_calc(val1, val2, operator):
    result = {
        "+": val1.__add__, "-": val1.__sub__,
        "*": val1.__mul__, "/": val1.__truediv__,
        "^": val1.__pow__
        }[operator](val2).tolist()
    return json_dumps(result)

class TimedCall(ContextDecorator):
    def __init__(self, prefix=None):
        self.prefix = prefix if prefix else ""

    def __enter__(self):
        self.t = time()
        return self

    def __exit__(self, *exc):
        print("{}{:.4f}s".format(self.prefix, time()-self.t))
        return False


def prepare_folder():
    for i in range(10):
        try:
            tmp_path = "/tmp/" + get_name()
            os.mkdir(tmp_path)
            return tmp_path
        except:
            continue
    raise ValueError("Unable to create folder")


def savefile(path, raw_data):
    with open(path, 'wb') as f:
        f.write(raw_data)


def mmh3_file(path):
    with open(path, 'rb') as f:
        buf = f.read()
    return mmh3_hash(buf)


def get_key(var):
    """Find and return an available key (ie. which is not in 'var')"""
    while True:
        k = ''.join([chr(choice(LIST_CHAR))
                    for i in range(25)])
        if k not in var:
            return k


def guess_separator(file, raw_data=None):
    """
    Ugly helper function to return the (guessed) separator of a csv file
    (TODO: replace by something better)

    Parameters
    ----------
    file: str
        Path to file to use.

    raw_data: str
        Csv file as string (optionnal, to be used if the csv file is already in
        memory; so it won't use the 'file' parameters if raw_data isn't empty).

    Returns
    -------
    sep: str or None
        The guessed separator or None.
    """
    if file:
        with open(file, 'r') as f:
            l = f.readline()
            l2 = f.readline()
    elif raw_data:
        raw_data = raw_data.split('\r\n' if '\r\n' in raw_data else '\n')
        l = raw_data[0]
        l2 = raw_data[1]
    else:
        return None
    c_comma1 = l.count(',')
    c_smcol1 = l.count(';')
    if '\t' in l and not (c_comma1 or c_smcol1):
        return '\t'
    elif c_comma1 and not c_smcol1:
        return ','
    elif c_smcol1 and not c_comma1:
        return ';'
    else:
        c_comma2 = l2.count(',')
        c_smcol2 = l2.count(';')
        if c_comma2 == c_comma1:
            if c_smcol1 != c_smcol2:
                return ','
            else:
                return None
        elif c_smcol2 == c_smcol1:
            if c_comma2 != c_comma1:
                return ';'
            else:
                return None

def extractShpZip(myzip, slots, directory):
    """
    Extract in "directory" the member of "myzip" which are listed in "slots".
    Replace any extension in uppercase by its lowercase couterpart and updated
    the "slots" dictionnary according to hold the real path of the extracted
    files.

    Parameters
    ----------
    myzip:

    slots: dict
        A mapping containing the reference extensions of the file to extract
        and their real name in the archive.

    directory: str
        The temporary directory in which extract the files.

    Returns
    -------
    slots: dict
        A mapping containing the reference extensions and the real path of the
        extracted files.
    """
    for ext, member in slots.items():
        rv = myzip.extract(member, path=directory)
        if not ext in rv:
            os.rename(rv, rv.replace(ext.upper(), ext))
            slots[ext] = rv.replace(ext.upper(), ext)
        else:
            slots[ext] = rv
    return slots

def fetch_zip_clean(dir_path, layer_name):
    filenames = os.listdir(dir_path)
    if len(filenames) == 1:
        filename = '/'.join([dir_path, filenames[0]])
        with open(filename, 'rb') as f:
            raw_data = f.read()
        os.remove(filename)
        os.removedirs(dir_path)
        return raw_data, filenames[0]
    else:
        zip_stream = BytesIO()
        myZip = ZipFile(zip_stream, "w", compression=ZIP_DEFLATED)
        for filename in filenames:
            f_name = "".join([dir_path, "/", filename])
            myZip.write(f_name, filename, ZIP_DEFLATED)
            os.remove(f_name)
        myZip.close()
        zip_stream.seek(0)
        os.removedirs(dir_path)
        return zip_stream.read(), ''.join([filename.split(".")[0], ".zip"])
