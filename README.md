# psm-dashboard

Dashboard code for displaying [PSM](http://projectpsm.org/) project status.

Like the PSM itself, the PSM Dashboard is [open source](LICENSE)
software.  The Dashboard displays PSM development status, showing
which features have been completed, which are in progress, and which
have yet to be started.

The code here combines information in the [PSM Features - RTM
Map](https://docs.google.com/spreadsheets/d/1avMeCIiayaCcx8fDzldo3KEiRHyM2qjjBuCXWKRwyao/edit?usp=sharing)
spreadsheet, the [PSM
requirements](https://github.com/SolutionGuidance/psm/tree/master/requirements),
and the [PSM issue
tracker](https://github.com/SolutionGuidance/psm/issues/) to produce JSON data
that is then used to generate progress charts that show both high-level and
detailed views of the PSM's feature progress.

The JS, CSS, and HTML files that generate the charts from the JSON data live in
the main `psm` repo, in the `gh-pages` branch, which is the source code for the
`projectpsm.org` website.

## Quick Start Guide: How to Refresh the Live Dashboard

Run the `refresh-dashboard` script in this directory.  It will tell
you about any config preparation you need to make.  Once the
configuration is properly set up, `refresh-dashboard` will produce
`features-info.json`.  You will see a lot of progress output along the
way.  For reference, the script seems to usually take 2-3 minutes to
run, when your machine has a good Net connection.

(For details on Python module dependencies and using a virtual
environment see the comments at the top of the `gather-info` script.)

Once `features-info.json` is ready, copy the new version of it into the
`dashboard` directory in the `gh-pages` branch of the main `psm` repo,
replacing the previous version.  Then follow the README.md in that branch to
view the site and make sure everything looks right.  If it does, commit and
push the updated `features-info.json` to the origin `gh-pages` branch of
the main `psm` repo.

Now visit http://projectpsm.org/dashboard to check that the live site
is refreshed.  You may need to clear your browser's cache to see the
updated version.

## Development guidelines

We're pretty loose here right now.  A few things:

1. Use conventional indentation (spaces not tabs; 4 spaces per level for
   Python).

2. Feel free to use branches and PRs, but it's okay to push directly
   to master too.

## What's here.

* `refresh-dashboard`
   Script to orchestrate everything: gather and combine the
   features/RTM mapping, the requirements, and the issue labels so as
   to produce `refresh-dashboard.json`.

* `gather-info`
  This is the main script that `refresh-dashboard` drives.  This
  script gathers information from various PSM project sources
  (high-level features list, requirements list, issue tracker) and
  turns it into JSON, which is then used as input to the dashboard
  display code.  See the "Data format" section in this document for
  details about the JSON format.

* `psm-reqs.py`
  A Python module for treating PSM reqs programmatically.

* `format-reqs`
  Parse PSM reqs and print them out in various ways.
  (This is is meant mainly for other programs to use; see `show-reqs`
  for example.)

* `show-reqs`
  A script to print out requirements in various formats.

* `psm_reqs.el`
  Emacs Lisp for working with PSM reqs.  Load this file (i.e., with
  `M-x load-file`).  Then do `./show-reqs elisp > reqs.el` at a
  command line.  Now you can run `M-x psm-load-req` in Emacs,
  pointing it at the 'reqs.el' file, to load all of the PSM reqs into
  Emacs.  Bind the Emacs command `psm-show-req` to whatever keybinding
  you want -- e.g., `(global-set-key "\C-cr" 'psm-show-req)` -- and
  now whenever point (meaning your text cursor) is inside a req ID,
  you can do `C-c r` to see a popup description of that requirement.

* `non-hidden-RTM-rows.org`
  An initial export of PSM requirements to Org Mode format (done manually,
  I believe, not with psm_reqs.py).  This export turned out to be missing
  some hidden rows; see the next entry about that.

* `hidden-RTM-rows.org`
  The remainder of the Org Mode export (see above).  Here's how you
  know that this file and non-hidden-RTM-rows.org have different reqs:

          $ grep -E "^\* psm-" hidden-RTM-rows.org | cut -c 3- > hidden-reqs
          $ grep -E "^\* psm-" non-hidden-RTM-rows.org | cut -c 3- > non-hidden-reqs
          $ sort hidden-reqs > h.tmp; mv h.tmp hidden-reqs
          $ sort non-hidden-reqs > n.tmp; mv n.tmp non-hidden-reqs
          $ comm -1 -2 hidden-reqs non-hidden-reqs
          $ diff -u hidden-reqs non-hidden-reqs
          $ rm hidden-reqs non-hidden-reqs

* `added-reqs.org`
  Requirements we created during the first issues/reqs sweep, which
  used only the non-hidden rows, as we didn't know about the hidden
  rows at the time.  Therefore, some of the newly created reqs in
  added-reqs.orq are redundant with existing reqs; there is more
  detail about this in the file.  Others are not redundant -- they
  represent genuinely new requirements that we came up with during
  our requirements sweep.  All of the added reqs are, I believe, also
  present in non-hidden-RTM-rows.org, since the added reqs were
  created during the initial issues/reqs sweep.

  What we should do with redundant new reqs now:

  Once we're sure we've identified every one of them, we should make
  sure none of them are attached to any issues, and then remove all
  the redundant reqs from any file that has them (RTM.xlsx in the PSM
  repository, added-reqs.org here, and *-RTM-rows.org here too just to
  be safe).

  What we should do with non-redundant new reqs now:

  They should stay, of course, but note that the removal of some of
  the redundant ones might lead to the downward renumbering of some
  non-redundant ones.

* `issues-2018-03-31.org`
  An export of all issues and their labels, up to issue 740, plus some
  information about which issues should get which req-related labels.

  The information in this file was converted to JSON and fed to
  ots-tools/github-tools/gh-sak, to put req labels on our issues.
  Those JSON files are still around on the PSM repository's archival
  rtm-issue-linking branch, but we haven't preserved them here.

## Data format

This is the JSON data input format that the dashboard expects:

      "features": {
        "psm-feature-000": {
          "description": String,
          "status": String ["Complete", "InProgress", "NotStarted", "Ongoing"],
          "startDate": String[Date] or null,
          "completedDate": String[Date] or null,
          "requirements": [
            "psm-FR-8.2",
            "psm-FR-8.3",
            ...
          ]
        },
        "psm-feature-001": {
          ...
        }
      }


      "requirements": {
        "psm-FR-8.2": {
          "description": String,
          "status": String ["Complete", "InProgress", "NotStarted", "Ongoing"],
          "startDate": String[Date] or null,
          "completedDate": String[Date] or null,
          "issues": [
            123,
            456,
            789,
            ...
          ]
        },
        "psm-FR-8.3": {
          ...
        },
        ...
      }


      "issues": {
        "123": {
          "title": String,
          "description": String,
          "url": String,
          "status": String ["Complete", "InProgress", "NotStarted", "Ongoing"],
          "startDate": String[Date] or null,
          "completedDate": String[Date] or null,
        },
        "456": {
          ...
        },
        ...
      }

Fields without values (e.g. startDate, or completedDate) should be
`null` which is JSON's way of representing absence of a value:

      {
        "startDate": null
      }

And dates should be represented as strings in ISO 8601 format
(https://www.w3.org/TR/NOTE-datetime) which can readily be converted into JS
Date objects if needed:

      {
        "startDate": "2018-06-11"
      }

Minimum precision for dates should be the day (as above), but hours and minutes
can also optionally be included:

      {
        "startDate": "2018-06-11T19:20+01:00"
      }
